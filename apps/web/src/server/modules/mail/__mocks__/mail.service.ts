vi.mock(import('../mail.service'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // Due to vi.mock being hoisted, we have to mock here directly instead of
    // defining an exampleMock outside and assign it to example
    sendMail: vi.fn(),
  }
})
