import React, { useState, useEffect, useRef } from "react";

const produtosDisponiveis = [
  // EQUIPAMENTOS
  { id: "EQ001", descricao: "Sirene", preco: 120.0, estoque: true },
  { id: "EQ002", descricao: "Detector", preco: 85.5, estoque: true },
  { id: "EQ003", descricao: "Central de Alarme", preco: 450.0, estoque: true },
  { id: "EQ004", descricao: "Cilindro", preco: 210.0, estoque: true },
  { id: "EQ005", descricao: "Acionador Manual", preco: 130.0, estoque: true },

  // MATERIAIS
  { id: "2197", descricao: "Bateria Selada 12ah / 12v", preco: 500.0, estoque: true },
  { id: "MT002", descricao: "Fonte", preco: 220.0, estoque: true },
  { id: "MT003", descricao: "Filtro", preco: 75.0, estoque: true },
  { id: "MT004", descricao: "Módulo", preco: 145.0, estoque: true },
  { id: "MT005", descricao: "Válvula", preco: 90.0, estoque: true },
  { id: "MT006", descricao: "Chave", preco: 40.0, estoque: true },
  { id: "MT007", descricao: "Placa de sinalização", preco: 60.0, estoque: true },

  // OUTROS
  { id: "P0001", descricao: "Produto 33218938", preco: 48.708, estoque: true },
  { id: "P0002", descricao: "Produto 28371922", preco: 39.99, estoque: false },
  { id: "P0003", descricao: "Produto 29319320", preco: 90.315, estoque: true },
  {
    id: "0001",
    descricao: "Mão de obra especializada para instalação dos equipamentos(*)",
    preco: 1500.0,
    estoque: true,
  },
];

function FormularioPedidosFuncionarios() {
  const [pedidos, setPedidos] = useState(() => {
    const pedidosSalvos = localStorage.getItem("pedidos");
    if (pedidosSalvos) {
      const pedidosParse = JSON.parse(pedidosSalvos);
      return pedidosParse.map((p) => ({ produto: p.produto || null, quantidade: p.quantidade }));
    }
    return [];
  });

  const [filtros, setFiltros] = useState(pedidos.map(() => ""));
  const [abertos, setAbertos] = useState(pedidos.map(() => false));
  const fadeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
  }, [pedidos]);

  const adicionarPedido = () => {
    setPedidos([...pedidos, { produto: null, quantidade: 1 }]);
    setFiltros([...filtros, ""]);
    setAbertos([...abertos, false]);
  };

  const removerPedido = (index) => {
    const novosPedidos = [...pedidos];
    novosPedidos.splice(index, 1);
    setPedidos(novosPedidos);

    const novosFiltros = [...filtros];
    novosFiltros.splice(index, 1);
    setFiltros(novosFiltros);

    const novosAbertos = [...abertos];
    novosAbertos.splice(index, 1);
    setAbertos(novosAbertos);
  };

  const atualizarProduto = (index, produto) => {
    const novosPedidos = [...pedidos];
    novosPedidos[index].produto = produto;
    setPedidos(novosPedidos);

    const novosFiltros = [...filtros];
    novosFiltros[index] = "";
    setFiltros(novosFiltros);

    const novosAbertos = [...abertos];
    novosAbertos[index] = false;
    setAbertos(novosAbertos);
  };

  const atualizarQuantidade = (index, quantidade) => {
    const novosPedidos = [...pedidos];
    novosPedidos[index].quantidade = quantidade;
    setPedidos(novosPedidos);
  };

  const atualizarFiltro = (index, valor) => {
    const novosFiltros = [...filtros];
    novosFiltros[index] = valor;
    setFiltros(novosFiltros);

    const novosAbertos = [...abertos];
    novosAbertos[index] = true;
    setAbertos(novosAbertos);
  };

  const abrirLista = (index) => {
    const novosAbertos = [...abertos];
    novosAbertos[index] = true;
    setAbertos(novosAbertos);
  };

  const valorTotal = pedidos.reduce(
    (total, p) => (p.produto && p.produto.estoque ? total + p.quantidade * p.produto.preco : total),
    0
  );

  const temProdutoInvalido = pedidos.some((p) => !p.produto || !p.produto.id);
  const temProdutoSemEstoque = pedidos.some((p) => p.produto && !p.produto.estoque);
  const semPedidos = pedidos.length === 0;
  const botaoDesabilitado = temProdutoInvalido || temProdutoSemEstoque || semPedidos;

  const handleEnviar = () => {
    if (botaoDesabilitado) {
      alert(
        "Verifique se todos os produtos estão selecionados e disponíveis em estoque antes de enviar!"
      );
      return;
    }
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    alert("Pedido enviado com sucesso!");
    console.log("Pedidos salvos:", pedidos);
  };

  useEffect(() => {
    if (fadeRef.current) {
      fadeRef.current.classList.add("opacity-100", "translate-y-0");
    }
  }, []);

  return (
    <div className="flex justify-center items-start w-full min-h-screen pt-28 pb-10 bg-white">
      <div
        ref={fadeRef}
        className="fade-in p-6 bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto opacity-0 translate-y-5 transition-all duration-700"
        style={{ borderTop: "6px solid #202e3fff" }}
      >
        <h2 className="text-lg font-bold mb-3 text-center text-[#0b1e36]">
          Formulário de Pedidos
        </h2>

        {pedidos.map((pedido, index) => {
          const produtosFiltrados = produtosDisponiveis.filter((p) =>
            p.descricao.toLowerCase().includes(filtros[index]?.toLowerCase() || "")
          );

          return (
            <div
              key={index}
              className="relative grid grid-cols-3 gap-3 items-center mb-3 bg-gray-100 p-3 rounded-lg border border-[#d62828]/30"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar produto..."
                  value={filtros[index]}
                  onChange={(e) => atualizarFiltro(index, e.target.value)}
                  onFocus={() => abrirLista(index)}
                  className={`p-2 rounded border w-full focus:outline-none focus:ring-2 ${
                    !pedido.produto ? "border-red-500" : "border-gray-300"
                  } focus:ring-[#d62828]`}
                />
                {abertos[index] && (
                  <ul className="absolute z-50 w-full bg-white border max-h-52 overflow-y-auto rounded shadow-lg mt-1">
                    {(filtros[index] ? produtosFiltrados : produtosDisponiveis).map((produto) => (
                      <li
                        key={produto.id}
                        onClick={() => atualizarProduto(index, produto)}
                        className={`p-2 cursor-pointer hover:bg-[#0b1e36] hover:text-white transition ${
                          !produto.estoque ? "text-gray-400 cursor-not-allowed" : ""
                        }`}
                      >
                        {produto.descricao} {produto.estoque ? "" : "(Sem estoque)"}
                      </li>
                    ))}
                    {(filtros[index] ? produtosFiltrados : produtosDisponiveis).length === 0 && (
                      <li className="p-2 text-gray-500">Nenhum produto encontrado</li>
                    )}
                  </ul>
                )}
              </div>

              <div>
                <input
                  type="number"
                  value={pedido.quantidade}
                  min={1}
                  onChange={(e) => atualizarQuantidade(index, Number(e.target.value))}
                  className="p-2 rounded border w-full focus:outline-none focus:ring-2 focus:ring-[#d62828]"
                />
              </div>

              <div className="text-sm">
                <p>{pedido.produto ? pedido.produto.descricao : "Nenhum produto selecionado"}</p>
                {pedido.produto && (
                  <p className="text-gray-600 text-xs">
                    LPU: R${pedido.produto.preco.toFixed(2)}{" "}
                    {pedido.produto.estoque ? (
                      <span className="text-green-600 font-semibold">(Em estoque)</span>
                    ) : (
                      <span className="text-red-600 font-semibold">(Sem estoque)</span>
                    )}
                  </p>
                )}
              </div>

              <button
                onClick={() => removerPedido(index)}
                className="absolute right-2 top-2 bg-[#d62828] text-white rounded-full w-8 h-8 font-bold hover:bg-red-700 transition"
              >
                X
              </button>
            </div>
          );
        })}

        <button
          onClick={adicionarPedido}
          className="bg-[#0b1e36] hover:bg-blue-700 text-white px-3 py-1 rounded-lg mt-2 transition-all"
        >
          + Adicionar Produto
        </button>

        <div className="bg-gray-50 p-3 mt-4 rounded-lg shadow-inner border border-[#0b1e36]/20">
          <h3 className="font-semibold text-center text-[#0b1e36]">Total</h3>
          <table className="w-full text-sm mt-2 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1 text-center">Qtd</th>
                <th className="border px-2 py-1">Produto</th>
                <th className="border px-2 py-1 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p, i) => (
                <tr
                  key={i}
                  className={
                    !p.produto || (p.produto && !p.produto.estoque)
                      ? "opacity-50 text-gray-500"
                      : ""
                  }
                >
                  <td className="border px-2 py-1">{p.produto ? p.produto.id : "-"}</td>
                  <td className="border px-2 py-1 text-center">{p.quantidade}</td>
                  <td className="border px-2 py-1">{p.produto ? p.produto.descricao : "-"}</td>
                  <td className="border px-2 py-1 text-right">
                    {p.produto && p.produto.estoque
                      ? `R$${(p.quantidade * p.produto.preco).toFixed(2)}`
                      : "Indisponível"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-bold text-right text-[#0b1e36]">
            Valor Total: R${valorTotal.toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleEnviar}
          disabled={botaoDesabilitado}
          className={`mt-4 w-full py-2 rounded-lg font-bold transition-all ${
            botaoDesabilitado
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0b1e36] hover:bg-[#d62828] text-white"
          }`}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default FormularioPedidosFuncionarios;
