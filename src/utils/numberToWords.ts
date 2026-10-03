/**
 * French number to words converter for official administrative receipts and payment statements
 * (Arrêté le présent état à la somme de : ...)
 */

const units = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const tens = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  if (num < 20) {
    return units[num];
  }
  
  const tenDigit = Math.floor(num / 10);
  const unitDigit = num % 10;
  
  if (tenDigit === 7) {
    if (unitDigit === 1) return 'soixante et onze';
    return `soixante-${units[10 + unitDigit]}`;
  }
  
  if (tenDigit === 9) {
    return `quatre-vingt-${units[10 + unitDigit]}`;
  }
  
  if (tenDigit === 8 && unitDigit === 0) {
    return 'quatre-vingts';
  }
  
  if (unitDigit === 0) {
    return tens[tenDigit];
  }
  
  if (unitDigit === 1 && tenDigit !== 8) {
    return `${tens[tenDigit]} et un`;
  }
  
  return `${tens[tenDigit]} ${units[unitDigit]}`.trim();
}

function convertHundreds(num: number): string {
  if (num < 100) return convertLessThanThousand(num);
  
  const hundredDigit = Math.floor(num / 100);
  const remainder = num % 100;
  
  let hundredStr = '';
  if (hundredDigit === 1) {
    hundredStr = 'cent';
  } else {
    hundredStr = `${units[hundredDigit]} cent`;
    if (remainder === 0) {
      hundredStr += 's';
    }
  }
  
  if (remainder === 0) return hundredStr;
  return `${hundredStr} ${convertLessThanThousand(remainder)}`.trim();
}

export function numberToWordsFR(num: number, currency: string = 'MRU'): string {
  if (isNaN(num) || num === 0) return `Zéro ${currency}.`;
  
  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);
  
  if (integerPart === 0 && decimalPart > 0) {
    return `Zéro ${currency} et ${convertHundreds(decimalPart)} centimes.`;
  }

  const billions = Math.floor(integerPart / 1_000_000_000);
  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000);
  const remainder = integerPart % 1_000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(billions === 1 ? 'un milliard' : `${convertHundreds(billions)} milliards`);
  }

  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${convertHundreds(millions)} millions`);
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(`${convertHundreds(thousands)} mille`);
    }
  }

  if (remainder > 0) {
    parts.push(convertHundreds(remainder));
  }

  let words = parts.join(' ').trim();
  // Capitalize first letter
  if (words.length > 0) {
    words = words.charAt(0).toUpperCase() + words.slice(1);
  }

  if (decimalPart > 0) {
    return `${words} ${currency} et ${convertHundreds(decimalPart)} centimes.`;
  }

  return `${words} ${currency}.`;
}
