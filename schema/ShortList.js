import mongoose from 'mongoose';

const ShortListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    shortListedIds:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }],
    shortListedByIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }]
})


const ShortList = mongoose.model('ShortList', ShortListSchema);
export default ShortList;