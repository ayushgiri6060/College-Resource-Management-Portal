const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Notes data persistence
const notesFile = path.join(__dirname, 'notes-data.json');
let uploadedNotes = [];
if (fs.existsSync(notesFile)) {
    try {
        uploadedNotes = JSON.parse(fs.readFileSync(notesFile, 'utf8'));
    } catch (e) {
        uploadedNotes = [];
    }
}

// Rides data persistence
const ridesFile = path.join(__dirname, 'rides-data.json');
let uploadedRides = [];
if (fs.existsSync(ridesFile)) {
    try {
        uploadedRides = JSON.parse(fs.readFileSync(ridesFile, 'utf8'));
    } catch (e) {
        uploadedRides = [];
    }
}

// Lectures data persistence
const lecturesFile = path.join(__dirname, 'lectures-data.json');
let uploadedLectures = [];
if (fs.existsSync(lecturesFile)) {
    try {
        uploadedLectures = JSON.parse(fs.readFileSync(lecturesFile, 'utf8'));
    } catch (e) {
        uploadedLectures = [];
    }
}

// Books data persistence
const booksFile = path.join(__dirname, 'books-data.json');
let uploadedBooks = [];
if (fs.existsSync(booksFile)) {
    try {
        uploadedBooks = JSON.parse(fs.readFileSync(booksFile, 'utf8'));
    } catch (e) {
        uploadedBooks = [];
    }
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to prevent path traversal
        const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, TXT, PNG, JPG files are allowed'));
        }
    }
});

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// Upload a note
app.post('/api/upload-note', upload.single('noteFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, seller, contact, cgpa, price, description } = req.body;

    if (!title || !seller || !contact || !cgpa || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const note = {
        id: Date.now(),
        title: title.substring(0, 100),
        description: (description || '').substring(0, 200),
        seller: seller.substring(0, 50),
        contact: contact.substring(0, 15),
        cgpa: cgpa.substring(0, 5),
        price: price.substring(0, 10),
        filename: req.file.originalname,
        filepath: '/uploads/' + req.file.filename
    };

    uploadedNotes.push(note);
    fs.writeFileSync(notesFile, JSON.stringify(uploadedNotes, null, 2));
    res.json(note);
});

// Get all uploaded notes
app.get('/api/notes', (req, res) => {
    res.json(uploadedNotes);
});

// Add a ride
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/add-ride', (req, res) => {
    const { from, to, driver, contact, date, price } = req.body;

    if (!from || !to || !driver || !contact || !date || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const ride = {
        id: Date.now(),
        from: from.substring(0, 50),
        to: to.substring(0, 50),
        driver: driver.substring(0, 50),
        contact: contact.substring(0, 15),
        date: date.substring(0, 30),
        price: price.substring(0, 10)
    };

    uploadedRides.push(ride);
    fs.writeFileSync(ridesFile, JSON.stringify(uploadedRides, null, 2));
    res.json(ride);
});

// Get all rides
app.get('/api/rides', (req, res) => {
    res.json(uploadedRides);
});

// Add a lecture
app.post('/api/add-lecture', (req, res) => {
    const { title, teacher, contact, cgpa, price } = req.body;

    if (!title || !teacher || !contact || !cgpa || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const lecture = {
        id: Date.now(),
        title: title.substring(0, 100),
        teacher: teacher.substring(0, 50),
        contact: contact.substring(0, 15),
        cgpa: cgpa.substring(0, 5),
        price: price.substring(0, 10)
    };

    uploadedLectures.push(lecture);
    fs.writeFileSync(lecturesFile, JSON.stringify(uploadedLectures, null, 2));
    res.json(lecture);
});

// Get all lectures
app.get('/api/lectures', (req, res) => {
    res.json(uploadedLectures);
});

// Add a book
app.post('/api/add-book', (req, res) => {
    const { title, price, contact } = req.body;

    if (!title || !price || !contact) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const book = {
        id: Date.now(),
        title: title.substring(0, 100),
        price: price.substring(0, 10),
        contact: contact.substring(0, 15)
    };

    uploadedBooks.push(book);
    fs.writeFileSync(booksFile, JSON.stringify(uploadedBooks, null, 2));
    res.json(book);
});

// Get all books
app.get('/api/books', (req, res) => {
    res.json(uploadedBooks);
});

// Error handling for multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File too large. Max 10MB allowed.' });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.listen(PORT, () => {
    console.log('EduVault server running at http://localhost:' + PORT);
});