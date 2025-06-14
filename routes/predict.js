import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { supabase } from '../connect/supabase.js';

export default [
  {
    method: 'POST',
    path: '/predict',
    options: {
      payload: {
        output: 'file',         // Simpan file sementara di disk
        parse: true,
        multipart: true,
        allow: 'multipart/form-data',
        maxBytes: 5 * 1024 * 1024, // Max 5MB
      },
    },
    handler: async (request, h) => {
      try {
        const file = request.payload.image;

        if (!file || !file.path) {
          return h.response({ error: 'No file uploaded' }).code(400);
        }

        // Kirim file ke ML API
        const form = new FormData();
        form.append('image', fs.createReadStream(file.path), file.filename);

        const mlResponse = await axios.post(
          'https://api-model-v1.onrender.com/predict',
          form,
          { headers: form.getHeaders() }
        );

        const { prediction } = mlResponse.data;

        // Ambil detail penyakit dari Supabase (disease_data)
        const { data, error } = await supabase
          .from('disease_data')
          .select('name, explanation, treatment')
          .eq('name', prediction)
          .single();

        if (error) {
          console.error('Supabase error:', error.message);
          return h.response({ error: 'Disease not found' }).code(404);
        }

        console.log(data.name, data.explanation, data.treatment);

        return h.response({
          label: data.name,
          explanation: data.explanation,
          treatment: data.treatment,
        }).code(200);

      } catch (err) {
        console.error('[PREDICT ERROR]', err.message);
        return h.response({ error: 'Prediction failed' }).code(500);
      }
    },
  },
];
