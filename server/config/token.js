import jwt from 'jsonwebtoken';
const generateToken = async (userId) => {
  try{
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET,{expiresIn: '1h'});
    return token;
  } catch (error) {
    throw new Error('Error generating token');  
  }
};

export default generateToken;
