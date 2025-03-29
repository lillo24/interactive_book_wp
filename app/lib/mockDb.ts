type User = {
    email: string;
    password: string;
  };
  
  let users: User[] = [];
  
  export const mockSignIn = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    return !!user; // Ritorna true se trova l'utente
  };
  
  export const mockSignUp = (email: string, password: string): boolean => {
    if (users.some(u => u.email === email)) {
      return false; // Email già esistente
    }
    users.push({ email, password });
    return true;
  };
  