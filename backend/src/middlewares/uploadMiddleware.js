const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (file.fieldname === "ktp") {
            cb(null, "uploads/ktp");
        }

        else if (file.fieldname === "kk") {
            cb(null, "uploads/kk");
        }

        else if (file.fieldname === "sktm") {
            cb(null, "uploads/sktm");
        }

        else if (file.fieldname === "surat_rujukan") {
            cb(null, "uploads/surat_rujukan");
        }
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

module.exports = multer({
    storage
});