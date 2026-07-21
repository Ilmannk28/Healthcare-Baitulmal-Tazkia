require('dotenv').config();


const express = require('express');
const cors = require('cors');

const app = express()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static('uploads'));

// get routes
const authRoutes = require("./routes/authRoutes");
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const wheelchairRoutes = require('./routes/wheelchairRoutes');
const khitanRoutes = require('./routes/khitanRoutes');
const requestRoutes = require("./routes/requestRoutes");
const analyticsRoutes  = require("./routes/analyticsRoutes");


app.use('/api/auth', authRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/wheelchairs', wheelchairRoutes);
app.use('/api/khitan', khitanRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/analytics',  analyticsRoutes);



app.get('/', (req, res) => {
    res.send('API Running...');
});



const PORT =
   process.env.PORT || 3000;


   //  Error-handling middleware 
app.use((err, req, res, next) => {
    console.error(err);

    // Error dari multer (mis. ukuran file melebihi batas)
    if (err.name === "MulterError") {
        return res.status(400).json({
            success: false,
            message: "Upload gagal: " + err.message
        });
    }

    // Error dari fileFilter (format dokumen tidak didukung)
    if (err.message === "Format tidak didukung.") {
        return res.status(400).json({
            success: false,
            message: "Format file tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG."
        });
    }

    // Fallback untuk error tak terduga lainnya
    return res.status(500).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server."
    });
});

app.listen(PORT, () => {
    console.log(`Aplikasi berhasil dijalankan di port ${PORT}...`);
});