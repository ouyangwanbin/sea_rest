var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {
        type: String,
        unique:true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    id_receive_msg: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', UserSchema);