const bcrypt = require('bcryptjs');

// 🛑 Replace 'your-secure-random-string-from-db' with your actual secret key
const SECRET_KEY = 'qwertyuiopasdfghjklzxcvbnm'; 

(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(SECRET_KEY, salt);
    console.log('Use this hash for the DB and .env:', hashedKey);
})();