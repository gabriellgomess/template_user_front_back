import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Modal, TextField, Typography, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AlertSnackbar from '../components/AlertSnackbar'; // Importando o novo componente

const apiUrl = `${import.meta.env.VITE_REACT_APP_URL}/api/users`;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [alertData, setAlertData] = useState({ open: false, message: '', severity: 'success' }); // Estado para o Snackbar
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    cpf: '',
    nivel_acesso: '',
    password: '',
    confirmPassword: ''
  });

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  // Função para obter todos os usuários
  const fetchUsers = async () => {
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      setUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      handleOpenAlert('Erro ao buscar usuários', 'error');
    }
  };

  // Função para criar ou atualizar um usuário
  const handleSaveUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      handleOpenAlert('As senhas não coincidem.', 'error');
      return;
    }

    if (!Object.values(passwordRequirements).every(Boolean) && !formData.id) {
      handleOpenAlert('A senha não atende a todos os requisitos.', 'error');
      return;
    }

    try {
      if (formData.id) {
        await axios.put(`${apiUrl}/${formData.id}`, formData, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        handleOpenAlert('Usuário atualizado com sucesso!', 'success');
      } else {
        await axios.post(apiUrl, formData, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        handleOpenAlert('Usuário criado com sucesso!', 'success');
      }
      fetchUsers();
      setOpenModal(false);
      setFormData({ id: null, name: '', email: '', cpf: '', nivel_acesso: '', password: '', confirmPassword: '' });
    } catch (error) {
      handleOpenAlert('Erro ao salvar usuário', 'error');
    }
  };

  // Função para excluir um usuário
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      handleOpenAlert('Usuário excluído com sucesso!', 'success');
      fetchUsers();
    } catch (error) {
      handleOpenAlert('Erro ao deletar usuário', 'error');
    }
  };

  // Abrir o modal de edição/criação de usuário
  const openUserModal = (user = null) => {
    if (user) {
      setFormData({ ...user, password: '', confirmPassword: '' });
    } else {
      setFormData({ id: null, name: '', email: '', cpf: '', nivel_acesso: '', password: '', confirmPassword: '' });
    }
    setOpenModal(true);
  };

  // Fechar o modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Atualizar a validação da senha
  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    setPasswordValidation(passwordRequirements);
  };

  // Buscar usuários quando o componente carregar
  useEffect(() => {
    fetchUsers();
  }, []);

  // Função para abrir o alerta
  const handleOpenAlert = (message, severity = 'success') => {
    setAlertData({ open: true, message, severity });
  };

  // Função para fechar o alerta
  const handleCloseAlert = () => {
    setAlertData({ ...alertData, open: false });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários
      </Typography>
      <Button
        startIcon={<PersonAddIcon />}
        variant="contained"
        color="primary"
        onClick={() => openUserModal()}
        sx={{ mb: 2 }}
      >
        Novo Usuário
      </Button>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Nível de Acesso</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.cpf}</TableCell>
                  <TableCell>{user.nivel_acesso}</TableCell>
                  <TableCell>
                  <IconButton disabled={user.email === 'admin@admin' ? true : false} color="primary" onClick={() => openUserModal(user)}>
                    <EditIcon />
                  </IconButton>
                    <IconButton disabled={user.email === 'admin@admin' ? true : false} color="secondary" onClick={() => handleDeleteUser(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Alert Snackbar Component */}
      <AlertSnackbar
        open={alertData.open}
        handleClose={handleCloseAlert}
        message={alertData.message}
        severity={alertData.severity}
      />

      {/* Modal para Criar/Editar Usuário */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {formData.id ? 'Editar Usuário' : 'Novo Usuário'}
          </Typography>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label="CPF"
            fullWidth
            margin="normal"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Nível de Acesso</InputLabel>
            <Select
              value={formData.nivel_acesso}
              onChange={(e) => setFormData({ ...formData, nivel_acesso: e.target.value })}
            >
              <MenuItem value={1}>Nível 1</MenuItem>
              <MenuItem value={2}>Nível 2</MenuItem>
              <MenuItem value={3}>Nível 3</MenuItem>
              <MenuItem value={4}>Nível 4</MenuItem>
              <MenuItem value={5}>Nível 5</MenuItem>
            </Select>
          </FormControl>

          {!formData.id && (
            <>
              <TextField
                label="Senha"
                type="password"
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              <TextField
                label="Confirmar Senha"
                type="password"
                fullWidth
                margin="normal"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />

              <Box>
                <Typography variant="body2" color={passwordRequirements.minLength ? 'green' : 'red'}>
                  - Pelo menos 8 caracteres
                </Typography>
                <Typography variant="body2" color={passwordRequirements.hasUpperCase ? 'green' : 'red'}>
                  - Pelo menos uma letra maiúscula
                </Typography>
                <Typography variant="body2" color={passwordRequirements.hasLowerCase ? 'green' : 'red'}>
                  - Pelo menos uma letra minúscula
                </Typography>
                <Typography variant="body2" color={passwordRequirements.hasNumber ? 'green' : 'red'}>
                  - Pelo menos um número
                </Typography>
                <Typography variant="body2" color={passwordRequirements.hasSpecialChar ? 'green' : 'red'}>
                  - Pelo menos um caractere especial
                </Typography>
              </Box>
            </>
          )}

          <Button variant="contained" color="primary" fullWidth onClick={handleSaveUser} sx={{ mt: 2 }}>
            {formData.id ? 'Atualizar' : 'Criar'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Users;
