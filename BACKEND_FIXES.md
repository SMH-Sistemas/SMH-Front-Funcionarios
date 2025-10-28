# 🔴 ANÁLISE COMPLETA DO PROBLEMA - Valores Errados no Pedido

## 📊 Problema Identificado

Quando um pedido é criado, os valores ficam **100x maiores** do que deveriam ser.

**Exemplo**:

- Produto com custo R$ 100 e margem 20% deveria custar R$ 120
- Mas está sendo calculado como R$ 2.100 ❌

---

# Correções Necessárias no Backend

## 🔴 ERRO 1: OrderService.java - Método buildOrderItems()

### Localização

Arquivo: `OrderService.java`
Método: `buildOrderItems()`
Linha aproximada: ~154

### Código Atual (ERRADO)

```java
// Preço unitário + lucro
double baseCost = product.getCost();
double profitMargin = product.getProfitMargin();
double priceWithProfit = baseCost + (baseCost * profitMargin);

orderItem.setUnitPrice(priceWithProfit);
orderItem.setSubtotal(priceWithProfit * itemDTO.quantity());
```

### Código Corrigido

```java
// Preço unitário + lucro
double baseCost = product.getCost();
double profitMargin = product.getProfitMargin();
double priceWithProfit = baseCost + (baseCost * (profitMargin / 100));

orderItem.setUnitPrice(priceWithProfit);
orderItem.setSubtotal(priceWithProfit * itemDTO.quantity());
```

### Exemplo

- **Antes**: Custo R$ 100, Margem 20% → `100 + (100 * 20) = R$ 2.100` ❌
- **Depois**: Custo R$ 100, Margem 20% → `100 + (100 * 0.20) = R$ 120` ✅

---

## 🔴 ERRO 2: Order.java - Método calculateTotalWithTax()

### Localização

Arquivo: `Order.java`
Método: `calculateTotalWithTax()`
Linha aproximada: ~68

### Código Atual (ERRADO)

```java
public void calculateTotalWithTax() {
    if (items == null || items.isEmpty()) {
        this.totalAmount = 0.0;
        return;
    }

    double subtotal = items.stream()
            .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
            .sum();

    double taxRate = (tax != null) ? tax.getPercentage() : 0.0;
    double taxAmount = subtotal * taxRate;

    this.totalAmount = subtotal + taxAmount;
}
```

### Código Corrigido

```java
public void calculateTotalWithTax() {
    if (items == null || items.isEmpty()) {
        this.totalAmount = 0.0;
        return;
    }

    double subtotal = items.stream()
            .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
            .sum();

    double taxRate = (tax != null) ? tax.getPercentage() : 0.0;
    double taxAmount = subtotal * (taxRate / 100);

    this.totalAmount = subtotal + taxAmount;
}
```

### Exemplo

- **Antes**: Subtotal R$ 1.000, Taxa 10% → `1000 * 10 = R$ 10.000` ❌
- **Depois**: Subtotal R$ 1.000, Taxa 10% → `1000 * 0.10 = R$ 100` ✅

---

## ✅ Observação

Note que em `Products.calculatePrice()` o cálculo está **CORRETO**:

```java
this.price = cost + (cost * (profitMargin / 100));
```

A inconsistência está apenas no `OrderService.buildOrderItems()` que não segue o mesmo padrão.

---

## 🎯 Resumo

**Problema**: Valores de porcentagem não estão sendo divididos por 100 antes de serem usados em multiplicações.

**Causa Raiz**:

- `profitMargin` vem como 20 (significando 20%), mas é usado como 20 ao invés de 0.20
- `taxRate` vem como 10 (significando 10%), mas é usado como 10 ao invés de 0.10

**Solução**: Dividir por 100 antes de usar em multiplicações.

**Impacto**: Valores ficam 100x maiores do que deveriam ser.

---

## 🔍 Fluxo de Dados

### Como funciona:

1. **Frontend** envia o pedido com `productId` para o backend
2. **Backend** busca o produto no banco usando: `productUtils.getProductById(itemDTO.product().productId())`
3. **Backend** pega `cost` e `profitMargin` do produto salvo no banco
4. **Backend** calcula o preço com lucro: `baseCost + (baseCost * profitMargin)` ❌

### O que está acontecendo:

- O produto no banco tem `cost = 100` e `profitMargin = 20` (representando 20%)
- O cálculo está fazendo: `100 + (100 * 20) = 2.100` ❌
- Deveria fazer: `100 + (100 * 0.20) = 120` ✅

---

## ⚠️ FRONTEND - Aviso

O frontend em `NovoPedidoModal.tsx` linha 230-231 está enviando:

```javascript
cost: 0,
profitMargin: 0,
```

Isso **NÃO é um problema** porque o backend ignora esses valores e busca do banco de dados usando o `productId`. Porém, para melhorar a consistência, você pode enviar os valores reais do produto no frontend também.

---
