// 🔐 Serviços de Autenticação Firebase para o Projeto Vestiário
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// 📝 Função de Cadastro
export const handleSignUp = async (email, password, role, name) => {
  try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Atualizar perfil do usuário com nome
    await updateProfile(user, {
      displayName: name
    });

    // 3. Criar documento do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      name: name,
      role: role, // 'player' ou 'owner'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });

    console.log('✅ Usuário cadastrado com sucesso:', user.uid);
    return { success: true, user: user, role: role };
    
  } catch (error) {
    console.error('❌ Erro no cadastro:', error);
    
    // Tratar erros específicos do Firebase
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email já está sendo usado. Tente fazer login ou use outro email.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido. Verifique o formato do email.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// 🔑 Função de Login
export const handleLogin = async (email, password) => {
  try {
    // 1. Autenticar usuário
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Buscar role do usuário no Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Login realizado com sucesso:', user.uid);
      return { 
        success: true, 
        user: user, 
        role: userData.role,
        userData: userData
      };
    } else {
      console.error('❌ Documento do usuário não encontrado');
      return { success: false, error: 'Dados do usuário não encontrados' };
    }
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    
    // Tratar erros específicos do Firebase
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Usuário não encontrado. Verifique o email ou cadastre-se.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Senha incorreta. Tente novamente.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido. Verifique o formato do email.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// 🚪 Função de Logout
export const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log('✅ Logout realizado com sucesso');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    return { success: false, error: error.message };
  }
};

// 👂 Listener de Estado de Autenticação
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuário logado - buscar dados no Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            user: user,
            role: userData.role,
            userData: userData,
            isAuthenticated: true
          });
        } else {
          // Usuário existe no Auth mas não no Firestore
          callback({
            user: user,
            role: null,
            userData: null,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados do usuário:', error);
        callback({
          user: user,
          role: null,
          userData: null,
          isAuthenticated: false
        });
      }
    } else {
      // Usuário não logado
      callback({
        user: null,
        role: null,
        userData: null,
        isAuthenticated: false
      });
    }
  });
};

// 🔍 Função para buscar dados do usuário
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'Usuário não encontrado' };
    }
  } catch (error) {
    console.error('❌ Erro ao buscar dados do usuário:', error);
    return { success: false, error: error.message };
  }
};

// 📝 Função para atualizar dados do usuário
export const updateUserData = async (uid, data) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('✅ Dados do usuário atualizados:', uid);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar dados do usuário:', error);
    return { success: false, error: error.message };
  }
};
