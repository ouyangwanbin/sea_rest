var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    expired_date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Token', TokenSchema);