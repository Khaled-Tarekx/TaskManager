import multer from "multer"
import path from "path"

const storage = multer.diskStorage( {
        destination: (req, file, cb) => {
                    cb(null, 'uploads/')
        },
        filename: (req , file, cb) => {
                let extension = path.extname(file.originalname)
                cb(null, Date.now() + extension)
        }
})

const uploads = multer({
    storage: storage
})

export default uploads
