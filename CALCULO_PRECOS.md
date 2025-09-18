# 💰 Como Funciona o Cálculo de Preços - Vestiário App

## 🧮 **Fórmula do Cálculo**

```
Preço Total = Duração (horas) × Preço por Hora da Quadra
```

## 📊 **Exemplos Práticos**

### **Exemplo 1: Quadra de Futebol**
- **Quadra**: Quadra 1 - Futebol
- **Preço por hora**: R$ 150,00
- **Horário selecionado**: 14:00 às 16:00
- **Duração**: 2 horas
- **Cálculo**: 2 × R$ 150,00 = **R$ 300,00**

### **Exemplo 2: Quadra de Tênis**
- **Quadra**: Quadra Tênis 1
- **Preço por hora**: R$ 80,00
- **Horário selecionado**: 10:00 às 11:30
- **Duração**: 1,5 horas
- **Cálculo**: 1,5 × R$ 80,00 = **R$ 120,00**

### **Exemplo 3: Campo de Futebol Premium**
- **Quadra**: Campo Futebol 1
- **Preço por hora**: R$ 250,00
- **Horário selecionado**: 19:00 às 22:00
- **Duração**: 3 horas
- **Cálculo**: 3 × R$ 250,00 = **R$ 750,00**

## 🏟️ **Preços por Hora das Quadras**

| Quadra | Esporte | Preço/Hora |
|--------|---------|------------|
| Quadra 1 - Futebol | Futebol | R$ 150,00 |
| Quadra 2 - Basquete | Basquete | R$ 120,00 |
| Quadra 3 - Vôlei | Vôlei | R$ 100,00 |
| Quadra Tênis 1 | Tênis | R$ 80,00 |
| Quadra Tênis 2 | Tênis | R$ 80,00 |
| Quadra Padel 1 | Padel | R$ 90,00 |
| Quadra Futsal 1 | Futsal | R$ 110,00 |
| Quadra Basquete Premium | Basquete | R$ 180,00 |
| Quadra Vôlei 1 | Vôlei | R$ 140,00 |
| Quadra Handebol | Handebol | R$ 160,00 |
| Quadra Tênis VIP | Tênis | R$ 200,00 |
| Quadra Badminton | Badminton | R$ 120,00 |
| Quadra Squash | Squash | R$ 100,00 |
| Campo Futebol 1 | Futebol | R$ 250,00 |
| Campo Futebol 2 | Futebol | R$ 250,00 |
| Quadra Futsal 1 | Futsal | R$ 150,00 |
| Quadra Futsal 2 | Futsal | R$ 150,00 |

## ⚙️ **Como o Sistema Calcula**

1. **Usuário seleciona quadra** → Sistema pega o `hourlyRate`
2. **Usuário escolhe horários** → Sistema calcula a duração
3. **Sistema aplica a fórmula** → `duração × preço_por_hora`
4. **Resultado é exibido** → Preço total calculado automaticamente

## 🔍 **Código do Cálculo**

```javascript
const calculateTotalPrice = (startTime, endTime, hourlyRate) => {
  if (!startTime || !endTime || !hourlyRate) return 0
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / (1000 * 60 * 60) // Converter para horas
  
  return Math.round(durationHours * hourlyRate * 100) / 100 // Arredondar para 2 casas decimais
}
```

## ✅ **Validações**

- ✅ Preço por hora definido para cada quadra
- ✅ Cálculo automático em tempo real
- ✅ Arredondamento para 2 casas decimais
- ✅ Validação de horários válidos
- ✅ Campo somente leitura (não pode editar)
- ✅ Botão desabilitado se preço = 0

## 🎯 **Resultado**

**SIM!** O valor total está sendo calculado corretamente:
- ✅ **Baseado no preço por hora** de cada quadra específica
- ✅ **Multiplicado pela duração** em horas selecionada pelo jogador
- ✅ **Calculado automaticamente** em tempo real
- ✅ **Não pode ser editado** manualmente pelo jogador





