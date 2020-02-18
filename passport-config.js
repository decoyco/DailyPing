const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('./models/user')

function initialize(passport, getUserById)
{
    const authenticateUser = async (email, password, done) =>
    {
        const user = await User.findOne({email: email})
        if (user==null)
        {
            return done(null, false, {message: 'No user with that email'})
        }
        try
        {
            if(await bcrypt.compare(password, user.password))
            {
                return done(null, user)
            }
            else
            {
                return done(null, false, {message: 'Password incorrect'})
            }
        }
        catch (e)
        {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email'},
    authenticateUser))

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (user, done) {
        //If using Mongoose with MongoDB; if other you will need JS specific to that schema.
        User.findById(user, function (err, user) {
            done(err, user);
        });
    });
}

module.exports = initialize