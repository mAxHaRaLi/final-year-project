import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.registeration.js';
import {verifyJWT} from '../middlewares/authinatation.middleware.js';
import {logoutUser} from '../controllers/user.controller.logout.js'; 
import {loginUser } from  '../controllers/user.controller.login.js';
import { upload } from '../middlewares/multer.middleware.js'; 

const router = Router();

  /* ---------------------- USER ROUTES ---------------------- */

//--------------public route - register---------------------
router.route('/register').post(
    upload.fields([
         { name: 'profileImage', maxCount: 1 }    

    ]),
    
    registerUser) 

  
//----------------public route - login---------------------
router.route('/login').post(loginUser);

//-----------------secure route - logout---------------------
router.route('/logout').post(verifyJWT, logoutUser);




export default router;
