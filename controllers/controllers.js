const { createClient } = require("@supabase/supabase-js");

exports.addNewMail = async (bodyData, res) => {
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

        const { email, preferredTime } = bodyData;

        let isPrevRecordUpdated = false;

        const { data, error } = await supabase
            .from('registered_mails')
            .select('email_id')
            .eq('email_id', email)
            .maybeSingle();

        if (error) {
            throw new Error('DB Error: ' + error.message);
        }

        if (!data) {
            const { error } = await supabase
                .from('registered_mails')
                .insert({ email_id: email, preferredTime: preferredTime });

            if (error) {
                throw new Error('DB Error: ' + error.message);
            }
        } else {

            await supabase
                .from('registered_mails')
                .update({ preferredTime: preferredTime })
                .eq('email_id', email);

            isPrevRecordUpdated = true;
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: "Email Registered Successfully", updated: isPrevRecordUpdated }));
    } catch (error) {
        console.error('Error While Fetching Data From DB:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: "Internal Server Error" }));
    }
};
