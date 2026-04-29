// Funções utilitárias e simulações compartilhadas

function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return cpf;
}

function formatPhone(phone) {
    phone = phone.replace(/\D/g, "");
    if (phone.length > 11) phone = phone.substring(0, 11);
    phone = phone.replace(/^(\d{2})(\d)/g, "($1) $2");
    phone = phone.replace(/(\d)(\d{4})$/, "$1-$2");
    return phone;
}

function formatCEP(cep) {
    cep = cep.replace(/\D/g, "");
    cep = cep.replace(/^(\d{5})(\d)/, "$1-$2");
    return cep;
}

function cpfDigits(cpf) {
    return String(cpf || "").replace(/\D/g, "");
}

function isValidEmail(email) {
    const s = String(email || "").trim();
    if (!s) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Retorna null se OK, senão string de erro (validação de etapa cadastro / checkout). */
function validarCpfBr(cpf) {
    const c = cpfDigits(cpf);
    if (c.length !== 11) return "CPF deve conter 11 dígitos.";
    if (/^(\d)\1{10}$/.test(c)) return "CPF inválido (dígitos repetidos).";
    let s = 0;
    let j = 10;
    for (let i = 0; i < 9; i++, j--) s += parseInt(c[i], 10) * j;
    let r = (s * 10) % 11;
    const d1 = r === 10 ? 0 : r;
    if (parseInt(c[9], 10) !== d1) return "CPF inválido. Confira os números.";
    s = 0;
    j = 11;
    for (let i = 0; i < 10; i++, j--) s += parseInt(c[i], 10) * j;
    r = (s * 10) % 11;
    const d2 = r === 10 ? 0 : r;
    if (parseInt(c[10], 10) !== d2) return "CPF inválido. Confira os números.";
    return null;
}

function validarNomeCompleto(nome) {
    const t = String(nome || "").trim();
    if (t.length < 6) return "Use nome e sobrenome (mín. 6 caracteres).";
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return "Informe nome e sobrenome completos.";
    if (/\d/.test(t)) return "O nome não deve conter números.";
    return null;
}

/** DDD+celular 11 dígitos (9 na posição) ou fixo 10. Aceita com ou sem 55. */
function validarTelefoneBr(digits) {
    let d = String(digits || "").replace(/\D/g, "");
    if (d.indexOf("55") === 0 && d.length >= 12) d = d.slice(2);
    if (d.length < 10 || d.length > 11) return "Telefone deve ter 10 (fixo) ou 11 (celular) dígitos com DDD.";
    const ddd = parseInt(d.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99) return "DDD inválido.";
    if (d.length === 11) {
        if (d.charAt(2) !== "9") return "Celular: após o DDD use 9 (ex.: 9xxxx-xxxx).";
    }
    return null;
}

// Bloqueio de comportamento padrão em links vazios ou inativos
document.addEventListener('DOMContentLoaded', () => {
    const deadLinks = document.querySelectorAll('a[href="#"], a[href=""]');
    deadLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Ação bloqueada (link higienizado)");
        });
    });
});
