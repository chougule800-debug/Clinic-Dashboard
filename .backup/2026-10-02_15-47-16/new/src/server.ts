import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGrokKey: Boolean(process.env.GROK_API_KEY) });
});

app.post('/api/parse-patient', async (req, res) => {
  try {
    const { text, customApiKey } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for patient intake parsing' });
    }
    const apiKeyToUse = (customApiKey && String(customApiKey).trim()) || process.env.GROK_API_KEY;
    if (!apiKeyToUse) {
      return res.json({ parsed: null, source: 'fallback_needed' });
    }

    const prompt = `You are a medical receptionist and clinical intake AI for a homeopathy clinic.
Extract structured patient information from this doctor's voice transcription or spoken paragraph:
"${text.trim()}"

Extract the following JSON fields:
- name: string (Patient's full name, capitalized cleanly)
- age: number or null
- gender: "Male" | "Female" | "Other"
- mobile: string (10-digit mobile number with +91 if provided)
- address: string
- bpSystolic: number or null
- bpDiastolic: number or null
- rbs: number or null
- weight: number or null
- heightInches: number or null
- allergies: string[]
- chronicDiseases: string[]
- chiefComplaints: string
- medicineGiven: string or null
- totalBill: number or null

Return ONLY a valid JSON object with no markdown backticks.`;

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKeyToUse}`
      },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || 'grok-4.7',
        messages: [
          { role: 'system', content: 'You are a medical intake assistant. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn('Grok parse-patient error:', err);
      return res.json({ parsed: null, source: 'error_fallback' });
    }

    const data = await response.json();
    const responseText = data?.choices?.[0]?.message?.content || '';
    let parsedData = null;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.warn('Failed to parse Grok JSON output:', responseText);
    }
    return res.json({ parsed: parsedData, source: 'grok' });
  } catch (error: any) {
    console.error('Grok patient parsing error:', error);
    return res.json({ parsed: null, error: error?.message, source: 'error_fallback' });
  }
});

app.post('/api/repertorize', async (req, res) => {
  try {
    const { prompt, method, customApiKey } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const apiKeyToUse = (customApiKey && String(customApiKey).trim()) || process.env.GROK_API_KEY;
    if (!apiKeyToUse) {
      return res.status(401).json({
        error: 'Grok API key is not configured. Please set GROK_API_KEY in the environment.'
      });
    }

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKeyToUse}`
      },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'You are an expert homeopathic repertory consultant. Provide clinical-grade Markdown analysis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Grok repertorization error:', err);
      return res.status(500).json({ error: 'Grok API execution failed' });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) {
      return res.status(502).json({ error: 'Grok returned an empty response.' });
    }
    return res.json({ result: text, method });
  } catch (error: any) {
    console.error('Grok repertorization error:', error);
    const msg = error?.message || 'Grok API execution failed';
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/doctors/create', async (req, res) => {
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return res.status(501).json({ error: 'Server-side doctor creation is not configured.' });
    }
    const { email, password, name, qualifications, regNo, speciality, clinicName, address, city, pinCode, phone, role } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password and name are required.' });
    }

    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: role || 'doctor' }
      })
    });

    const created = await createRes.json();
    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: created?.msg || created?.error || 'Failed to create auth user' });
    }

    const userId = created?.id;
    if (!userId) {
      return res.status(500).json({ error: 'Auth user created but no id returned' });
    }

    const profileUpdate = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        name,
        qualifications: qualifications || null,
        reg_no: regNo || null,
        speciality: speciality || null,
        clinic_name: clinicName || null,
        address: address || null,
        city: city || null,
        pin_code: pinCode || null,
        phone: phone || null,
        role: role || 'doctor'
      })
    });

    if (!profileUpdate.ok) {
      const errText = await profileUpdate.text();
      console.warn('Profile update failed:', errText);
    }

    return res.json({ success: true, userId });
  } catch (err: any) {
    console.error('Doctor creation error:', err);
    return res.status(500).json({ error: err?.message || 'Doctor creation failed' });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return res.status(501).json({ error: 'Server-side doctor deletion not configured.' });
    }
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id is required' });

    const delRes = await fetch(`${url}/auth/v1/admin/users/${id}`, {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });

    if (!delRes.ok) {
      const body = await delRes.text();
      return res.status(delRes.status).json({ error: body || 'Failed to delete user' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Doctor deletion error:', err);
    return res.status(500).json({ error: err?.message || 'Doctor deletion failed' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Homeopathy clinic server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();