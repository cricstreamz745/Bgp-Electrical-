export default {
  async fetch(req, env) {
    if (req.method === 'POST') {
      try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
          return new Response('No file uploaded', { status: 400 });
        }

        const fileName = Date.now() + '-' + file.name;

        const uploadRes = await fetch(`${env.SUPABASE_URL}/storage/v1/object/photos/${fileName}`, {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_KEY}`,
          },
          body: file.stream()
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          return new Response(`Upload failed: ${errText}`, { status: uploadRes.status });
        }

        const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;
        return new Response(JSON.stringify({ url: publicUrl }), {
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response('Error: ' + err.message, { status: 500 });
      }
    }

    return new Response('Use POST to upload file');
  }
};
