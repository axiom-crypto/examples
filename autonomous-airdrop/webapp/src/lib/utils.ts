const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

export const shortenAddress = (address: string) => {
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const numberToHex = (num: number) => {
  return `0x${num.toString(16)}`;
}

export const classes = (...classNames: (string | undefined | boolean)[]) =>
  classNames.filter((c) => !!c).join(' ');

export const forwardSearchParams = (searchParams: {[key: string]: string | string[] | undefined}): string => {
  // searchParams { address: '0xB392448932F6ef430555631f765Df0dfaE34efF3' }
  // -> "address=0xB392448932F6ef430555631f765Df0dfaE34efF3"
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, Array.isArray(value) ? value.join(',') : value);
    }
  });
  return params.toString();
}