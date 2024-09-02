import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
   
   name: String,
    email: {
      type: String,
      unique: true,
      sparse: true 
    },  
    phone: {
      type: String,
      unique: true,
      sparse: true 
      },
      password: {
        type: String,
        },
       
       
        createdAt: { type: Date, default: Date.now, index: true },
        lastActive: { type: Date, default: Date.now },
        isBlocked: { type: Boolean, default: false },
        isProfileComplete: { type: Boolean, default: false },
        personalDetailId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonalDetail' }
          
        
    
  });

  userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

export default User;
