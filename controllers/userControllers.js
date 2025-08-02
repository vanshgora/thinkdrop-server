exports.signup = async (req, res) => {
    try {
        const { email, name, preferredTime, password } = req.body;
        const users = thinkdropDB.collection('users');

        const isEmailExists = await users.findOne({ email: email });

        if (isEmailExists) {
            res.status(409).json({ success: false, message: "Email already exists and another mail" });
            return;
        }
        const encryptedPass = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

        const newUserCreated = await users.insertOne({ name, email, preferredTime, password: encryptedPass, isServicePaused: false });

        const token = await jwt.sign(newUserCreated, process.env.JWT_SECRET);

        if (!newUserCreated) {
            return res.status(500).send({ success: false, message: "Internal server error" });
        }

        return res.status(200).json({ success: true, message: 'User created successfully', user: newUserCreated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }

} 