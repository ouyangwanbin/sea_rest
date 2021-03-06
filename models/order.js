var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    product_id: {
        type: String,
        required: true
    },
    place_id: {
        type: String,
        required: true
    },
    order_date: {
        type: Date,
        default: Date.now
    },
    order_num: {
        type: Number,
        required: true
    },
    order_unit: {
        type: String,
        required: true
    },
    order_status:{
        type:String,
        default:"ordered"
    },
    order_note: {
        type: String
    }
});

module.exports = mongoose.model('Order', OrderSchema);