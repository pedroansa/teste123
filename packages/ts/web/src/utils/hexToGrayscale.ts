// Função para converter um valor decimal para hexadecimal
export function decimalToHex(decimal: number): string {
  return decimal.toString(16).padStart(2, '0');
}

// Função para converter uma cor hexadecimal para um tom de cinza (também em hexadecimal)
export function hexToGrayscale(hexColor: string): string {
  // Remove o símbolo "#" se presente
  const hex = hexColor.replace('#', '');

  // Extrai os valores R, G e B da string hexadecimal
  const r = parseInt(hex.slice(0, 2), 16); // Primeiro par
  const g = parseInt(hex.slice(2, 4), 16); // Segundo par
  const b = parseInt(hex.slice(4, 6), 16); // Terceiro par

  // Calcula a luminância em escala de cinza
  const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

  // Converte a luminância para hexadecimal
  const grayHex = decimalToHex(luminance);

  // Retorna o tom de cinza em formato hexadecimal
  return `#${grayHex}${grayHex}${grayHex}`;
}
