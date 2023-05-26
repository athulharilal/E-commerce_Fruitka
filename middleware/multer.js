const multer = require("multer");


const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/product-images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
  

module.exports={

    uploads:multer({storage:Storage}).array('images',3),
    uploads2:multer({storage:Storage}).array('images',1),
}