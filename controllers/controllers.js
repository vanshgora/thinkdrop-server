const { createClient } = require("@supabase/supabase-js");

exports.addNewMail = async (bodyData, res) => {
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

        const { email } = bodyData;

        console.log(email);
        const { data, error } = await supabase
            .from('registered_mails')
            .select('email_id')
            .eq('email_id', email)
            .maybeSingle();

        console.log(data);
        if (error) {
            throw new Error('DB Error: ' + error.message);
        }

        if (!data) {
            const { error } = await supabase
                .from('registered_mails')
                .insert({ email_id: email });

            if (error) {
                throw new Error('DB Error: ' + error.message);
            }
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: "Email Registered Successfully" }));
    } catch (error) {
        console.error('Error While Fetching Data From DB:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: "Internal Server Error" }));
    }
};
