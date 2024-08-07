import { sendMail } from '../services/emailService.js';
import { Users } from '../models/models.js';
import { generateTokenFromUser } from '../services/authService.js';
import { verifyToken, hashPassword } from '../services/authService.js';
import { userStatusEnum } from '../enums/userStatusEnum.js';

export const register = async (req, res) => {
    try {
        // // create user in db
        const { email, name, surname, status } = req.body;

        // initial status must be pending!
        if (status !== userStatusEnum.PENDING) {
            return res.status(400).json({
                message: 'Invalid user status',
                data: {},
            });
        }

        await createUser(req);

        // send email to user
        const subject = 'Poslan zahtjev za registraciju na Šou program';
        const content = `Hej ${name} ${surname},\n\nUspješno si započeo proces registracije!\nKada demonstrator odobri tvoj zahtjev, dobiti ćeš potvrdu registracije na email!\n\nVidimo se uskoro,\nŠou program ekipa`;
        sendMail({ mailTo: email, subject, content });

        // slanje emaila useru da potvrdi svoju email adresu
        const user = await Users().where({ email }).first();
        await sendEmailConfirmationRequest(user);

        // send email adminu
        const subject3 = 'Novi zahtjev za registraciju';
        const anchorTag2 = `<a href="${process.env.FRONTEND_URL}/search?id=${user.id}">Pregledaj zahtjev</a>`;
        const html2 = `Zaprimljen je novi zahtjev za registraciju korisnika ${name} ${surname}.<br>Klikni na link ispod kako bi odobrio/la zahtjev!<br>${anchorTag2}`;
        sendMail({
            mailTo: process.env.ADMIN_EMAIL,
            subject: subject3,
            html: html2,
        });

        return res.status(201).json({
            message: 'Registration successful',
            data: {},
        });
    } catch (error) {
        console.error(`[POST] Registration error: ${error.message}`);
        res.status(500).json({
            message: 'Internal server error',
            data: {},
        });
    }
};
export const sendEmailConfirmationRequest = async (user) => {
    const accessToken = generateTokenFromUser(user);
    const link = `${process.env.FRONTEND_URL}/confirm?accessToken=${accessToken}`;
    const anchorTag = `<a href="${link}">Potvrdi email</a>`;
    const subject2 = 'Potvrda emaila za Šou program';
    const html = `Hej ${user.name} ${user.surname},<br><br>Klikni na link ispod kako bi potvrdio svoj email!<br>${anchorTag}<br>Vidimo se uskoro,<br>Šou program ekipa`;
    sendMail({ mailTo: user.email, subject: subject2, html });
};

export const sendConfirmEmail = async (req, res) => {
    try {
        const { email } = req.query;
        const user = await Users().where({ email }).first();
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                data: {},
            });
        }
        if (user.email_verified) {
            return res.status(400).json({
                message: 'Email already confirmed',
                data: {},
            });
        }
        await sendEmailConfirmationRequest(user);
        return res.status(200).json({
            message: 'Email confirmation request sent',
            data: {},
        });
    } catch (error) {
        console.error(
            `[POST] Send email confirmation request error: ${error.message}`
        );
        res.status(500).json({
            message: 'Internal server error',
            data: {},
        });
    }
};

export const createUser = async (req) => {
    try {
        await Users().insert({
            name: req.body.name.trim(),
            surname: req.body.surname.trim(),
            email: req.body.email.trim(),
            email_verified: req.body.email_verified,
            username: req.body.username.trim(),
            password: await hashPassword(req.body.password),
            profile_picture_key: req.body.profile_picture_key,
            bio: req.body.bio.trim(),
            type: req.body.type,
            status: req.body.status,
        });
    } catch (error) {
        throw error;
    }
};
export const confirmEmail = async (req, res) => {
    try {
        const { accessToken } = req.query;

        // check if token exists
        if (!accessToken) {
            return res.status(401).json({ error: 'Missing token' });
        }
        // check if token is valid
        const tokenPayload = verifyToken(accessToken);
        if (!tokenPayload) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // get user from db
        const { id } = tokenPayload;

        const user = await Users().where({ id }).first();
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                data: {},
            });
        }

        const { email, name, surname, username, email_verified, status } = user;

        // check if email is already confirmed
        if (email_verified) {
            return res.status(400).json({
                message: 'Email already confirmed',
                data: { name, username, email },
            });
        }

        await Users().where({ id }).update({ email_verified: true });

        // send email to user
        let subject = `Potvrda emaila za Šou program`;
        let content = `Hej ${name} ${surname},\n\nUspješno si potvrdio svoj email!\n\nŠou program ekipa`;
        sendMail({ mailTo: email, subject, content });

        return res.status(200).json({
            message: 'Email successfully confirmed',
            data: { name, username, status, email },
        });
    } catch (error) {
        console.error(`[POST] Confirm email error: ${error.message}`);
        res.status(500).json({
            message: 'Internal server error',
            data: {},
        });
    }
};

export const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.query;
        const user = await Users().where({ username }).first();

        return res.json({
            message: 'Username check complete',
            data: {
                available: user === undefined ? true : false,
                statusMessage:
                    user === undefined
                        ? 'Korisničko ime je dostupno'
                        : 'Korisničko ime je zauzeto',
            },
        });
    } catch (error) {
        console.error(`[POST] Username check error: ${error.message}`);
        res.status(500).json({
            message: 'Internal server error',
            data: {},
        });
    }
};

export const checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.query;
        const user = await Users().where({ email }).first();

        return res.json({
            message: 'Email check complete',
            data: {
                available: user === undefined ? true : false,
                statusMessage:
                    user === undefined ? '' : 'Email se već koristi.',
            },
        });
    } catch (error) {
        console.error(`[POST] Email check error: ${error.message}`);
        res.status(500).json({
            message: 'Internal server error',
            data: {},
        });
    }
};
