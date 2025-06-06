async function setToken(token, disp) {
  await token.document.update({disposition: disp});
  token.refresh(true);
}

canvas.tokens.controlled.forEach(tkn => setToken(tkn, 1));
