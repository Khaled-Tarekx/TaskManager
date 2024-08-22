import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (_req, file, cb) => {
		cb(null, uuidv4() + '-' + file.originalname);
	},
});

const uploads = multer({
	storage,
});

export default uploads;
