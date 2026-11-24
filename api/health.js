module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    service: 'Ayush Creation B2B Portal (Vercel Serverless)',
    timestamp: new Date().toISOString()
  });
};
