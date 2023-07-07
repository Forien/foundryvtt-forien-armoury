async function setToken(disp)
{
  await token.document.update({disposition: disp})
  token.refresh(true)
}

if (!token) return;

setToken(1);