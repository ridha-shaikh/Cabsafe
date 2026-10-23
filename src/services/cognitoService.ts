import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: (import.meta.env.VITE_COGNITO_USER_POOL_ID as string)?.trim() || 'ap-south-1_G6wRwSbxn',
  ClientId: (import.meta.env.VITE_COGNITO_CLIENT_ID as string)?.trim() || 'h2bd6gr3qt1j0iofter77gp20',
};

export const userPool = new CognitoUserPool(poolData);

export interface CognitoAuthResult {
  idToken: string;
  accessToken: string;
  email: string;
  name?: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long.',
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter (A-Z).',
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter (a-z).',
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number (0-9).',
    };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message:
        'Password must contain at least one special character (!@#$%^&*...).',
    };
  }
  return { isValid: true };
};

export const parseCognitoError = (err: any): string => {
  const code = err?.code || err?.name;
  switch (code) {
    case 'CodeMismatchException':
      return 'Invalid verification code. Please check the 6-digit code in your email and try again.';
    case 'ExpiredCodeException':
      return 'Verification code has expired. Please click "Resend verification code" to receive a new code.';
    case 'UsernameExistsException':
      return 'An account with this email already exists.';
    case 'UserNotConfirmedException':
      return 'Account is not confirmed yet. Email verification is required before signing in.';
    case 'CodeDeliveryFailureException':
      return 'Unable to deliver verification code. Please verify the email address is valid.';
    case 'InvalidPasswordException':
      return 'Password does not meet security requirements (min 8 chars, uppercase, lowercase, number, special character).';
    case 'LimitExceededException':
      return 'Attempt limit exceeded. Please wait a few moments before trying again.';
    case 'UserNotFoundException':
      return 'No account found with this email.';
    case 'NotAuthorizedException':
      return 'Incorrect email or password.';
    default:
      return (
        err?.message ||
        'An unexpected error occurred during authentication.'
      );
  }
};

export const authenticateWithCognito = (
  email: string,
  password: string
): Promise<CognitoAuthResult> => {
  return new Promise((resolve, reject) => {
    const trimmedEmail = email.trim();
    const authenticationDetails = new AuthenticationDetails({
      Username: trimmedEmail,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: trimmedEmail,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result: CognitoUserSession) => {
        let name = '';
        try {
          const payload = result.getIdToken().decodePayload();
          name = payload['name'] || payload['preferred_username'] || '';
        } catch (e) {
          console.warn('Could not decode token payload for name:', e);
        }

        resolve({
          idToken: result.getIdToken().getJwtToken(),
          accessToken: result.getAccessToken().getJwtToken(),
          email: trimmedEmail,
          name,
        });
      },
      onFailure: (err) => {
        console.error('Cognito Auth Error:', err);
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        const attributesToSend: Record<string, string> = {};
        if (Array.isArray(requiredAttributes)) {
          for (const attr of requiredAttributes) {
            if (attr !== 'email' && userAttributes && userAttributes[attr]) {
              attributesToSend[attr] = userAttributes[attr];
            }
          }
        }

        cognitoUser.completeNewPasswordChallenge(password, attributesToSend, {
          onSuccess: (result: CognitoUserSession) => {
            let name = '';
            try {
              const payload = result.getIdToken().decodePayload();
              name = payload['name'] || payload['preferred_username'] || '';
            } catch (e) {
              console.warn('Could not decode token payload for name:', e);
            }

            resolve({
              idToken: result.getIdToken().getJwtToken(),
              accessToken: result.getAccessToken().getJwtToken(),
              email: trimmedEmail,
              name,
            });
          },
          onFailure: (err) => {
            console.error('Error completing new password challenge:', err);
            reject(err);
          },
        });
      },
    });
  });
};

export const registerWithCognito = (
  email: string,
  password: string,
  name?: string
): Promise<{ userSub: string; userConfirmed: boolean }> => {
  return new Promise((resolve, reject) => {
    const trimmedEmail = email.trim();
    const attributeList: CognitoUserAttribute[] = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: trimmedEmail,
      }),
    ];

    if (name) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: 'name',
          Value: name.trim(),
        })
      );
    }

    userPool.signUp(
      trimmedEmail,
      password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          console.error('Cognito SignUp Error:', err);
          reject(err);
          return;
        }
        if (!result) {
          reject(new Error('No result returned from Cognito'));
          return;
        }
        resolve({
          userSub: result.userSub,
          userConfirmed: result.userConfirmed,
        });
      }
    );
  });
};

export const confirmCognitoSignUp = (
  email: string,
  code: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email.trim(),
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code.trim(), true, (err, result) => {
      if (err) {
        console.error('Cognito Confirmation Error:', err);
        reject(err);
        return;
      }
      resolve(result || 'SUCCESS');
    });
  });
};

export const resendCognitoConfirmationCode = (
  email: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email.trim(),
      Pool: userPool,
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        console.error('Cognito Resend Code Error:', err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const updateCognitoUserName = (
  newName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No active user session found in AWS Cognito'));
      return;
    }

    cognitoUser.getSession((err: any, session: any) => {
      if (err || !session || !session.isValid()) {
        reject(err || new Error('Invalid or expired Cognito session'));
        return;
      }

      const attributeList = [
        new CognitoUserAttribute({
          Name: 'name',
          Value: newName.trim(),
        }),
      ];

      cognitoUser.updateAttributes(attributeList, (err: any, result: any) => {
        if (err) {
          console.error('Cognito update name error:', err);
          reject(err);
          return;
        }
        resolve(result || 'SUCCESS');
      });
    });
  });
};

export const changeCognitoPassword = (
  oldPassword: string,
  newPassword: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No active user session found in AWS Cognito'));
      return;
    }

    cognitoUser.getSession((err: any, session: any) => {
      if (err || !session || !session.isValid()) {
        reject(err || new Error('Invalid or expired Cognito session'));
        return;
      }

      cognitoUser.changePassword(oldPassword, newPassword, (err: any, result: any) => {
        if (err) {
          console.error('Cognito change password error:', err);
          reject(err);
          return;
        }
        resolve(result || 'SUCCESS');
      });
    });
  });
};

export const deleteCognitoUser = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No active user session found in AWS Cognito'));
      return;
    }

    cognitoUser.getSession((err: any, session: any) => {
      if (err || !session || !session.isValid()) {
        reject(err || new Error('Invalid or expired Cognito session'));
        return;
      }

      cognitoUser.deleteUser((err: any, result: any) => {
        if (err) {
          console.error('Cognito delete user error:', err);
          reject(err);
          return;
        }
        resolve(result || 'SUCCESS');
      });
    });
  });
};

export const getCurrentCognitoUser = (): CognitoUser | null => {
  return userPool.getCurrentUser();
};

export const signOutCognito = () => {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
};
