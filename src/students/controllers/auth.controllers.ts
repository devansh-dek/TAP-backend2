import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/Auth.service';
import { FirebaseAuthRepository } from '../repositories/FirebaseAuth.repository';
import { SERVER_CONFIG } from '../../config/serverConfig';
import { AuthenticatedRequest } from '../../types/express';
import { BadRequestError } from '../../errors/Bad-Request-Error';
import { AuthError } from '../../errors/Auth-Error';
import { extractRollNumber, validateIIITREmail } from '../../utils/validator';

const authService = new AuthService(new FirebaseAuthRepository());

export const register: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Invalid input data');
    }

    const { first_name, last_name, reg_email, mobile, linkedin, password } = req.body;
    
    if (!first_name || !last_name || !reg_email || !password) {
      throw new BadRequestError('Missing required fields');
    }

    if (!validateIIITREmail(reg_email)) {
      throw new BadRequestError('Invalid email format. Must be in format: name.2023ug1058@iiitranchi.ac.in');
    }

    const rollNumber = extractRollNumber(reg_email);
    if (!rollNumber) {
      throw new BadRequestError('Could not extract roll number from email');
    }

    const student = {
      firstName: first_name,
      lastName: last_name,
      regEmail: reg_email,
      rollNumber,
      mobile,
      linkedin,
      password
    };

    const { id, token } = await authService.register(student);

    res.cookie('token', token, {
      httpOnly: true,
      secure: SERVER_CONFIG.NODE_ENV === 'production',
      maxAge: SERVER_CONFIG.COOKIE_MAX_AGE,
    });

    res.status(201).json({ 
      success: true, 
      message: 'Student successfully registered', 
      data: { id, rollNumber } 
    });
  } catch (error) {
    console.log(error,"is our error")
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { reg_email, password } = req.body;
    if (!reg_email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const { id, token } = await authService.login(reg_email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: SERVER_CONFIG.NODE_ENV === 'production',
      maxAge: SERVER_CONFIG.COOKIE_MAX_AGE,
    });

    res.status(200).json({ success: true, message: 'Login successful', data: { id } });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError('Unauthorized access');
    }

    await authService.logout(userId);
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { reg_email } = req.body;
    if (!reg_email) {
      throw new BadRequestError('Email is required');
    }

    await authService.resetPassword(reg_email);
    res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const confirmResetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { code, new_password } = req.body;
    if (!code || !new_password) {
      throw new BadRequestError('Code and new password are required');
    }

    await authService.confirmResetPassword(code, new_password);
    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
