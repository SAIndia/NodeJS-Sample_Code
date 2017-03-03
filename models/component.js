var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var componentSchema = new Schema({
    name: String,
    controller_id: {type: Schema.Types.ObjectId, ref: 'Controller'},
    building_id: {type: Schema.Types.ObjectId, ref: 'Building'},
    inout_id: String,
    componentid: String,
    type: String,
    left: String,
    top: String,
    created_at: Date,
    updated_at: Date
});

componentSchema.pre('save', function (next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;

    next();

});

var Component = mongoose.model('Component', componentSchema);

module.exports = Component;