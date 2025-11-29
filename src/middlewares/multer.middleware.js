// import multer from 'multer';


//  const storage = multer.memoryStorage({
//     destination: function (req, file, cb) {
//        cb(null, "./public/temp");
//     },
    
//     filename: function (req, file, cb) {
       
//        cb(null, Date.now() + '-' + file.originalname);
//     }

//  });

//  export const upload = multer({ storage: storage });

import multer from "multer";


// Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
// app.post('/api/v1/users/register', upload.single('profileImage'), registerUser);

export const upload = multer({ storage: storage });
