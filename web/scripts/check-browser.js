async function verifyWorkspace(page) {
  // Run with playwright-cli -s=aqua-next run-code --filename=web/scripts/check-browser.js.
  const assert = (value, message) => {
    if (!value) throw new Error(message);
  };
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const origin = await page.evaluate(() => location.origin);
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Next transaction", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Show recorded step 3", exact: true })
    .click();
  const raw = page.getByRole("region", {
    name: "Raw Aqua capacity",
    exact: true,
  });
  const qos = page.getByRole("region", {
    name: "AquaQoS · 50% protected capacity",
    exact: true,
  });
  assert(
    (await raw.locator(".balance-main strong").innerText()).includes("1,000"),
    "raw depletion at step 3",
  );
  assert(
    (await qos.locator(".balance-main strong").innerText()).includes("4,000"),
    "guard retains inventory at step 3",
  );
  assert(
    (await qos.locator(".balance-main").innerText()).includes(
      "Capacity protected",
    ),
    "guard rejects competing fill",
  );
  await page
    .getByRole("button", { name: "Next transaction", exact: true })
    .click();
  assert(
    (await raw.locator(".balance-main").innerText()).includes(
      "Settlement failed",
    ),
    "raw sibling settlement fails",
  );
  assert(
    (await qos.locator(".balance-main").innerText()).includes("Fill settled"),
    "guarded sibling settles",
  );
  await qos.locator("summary").first().click();
  assert(
    (await qos.locator(".transfer-list li").count()) === 3,
    "actual successful transfer receipt has three events",
  );
  await raw.locator("summary").first().click();
  assert(
    (await raw.innerText()).includes("SafeTransferFromFailed"),
    "raw trace error displayed",
  );
  assert(
    (await raw.locator(".transfer-list li").count()) === 0,
    "reverted receipt has no transfers",
  );

  await page
    .getByRole("combobox", { name: "Workload", exact: true })
    .selectOption("replenishment");
  await page
    .getByRole("button", { name: "Show recorded step 3", exact: true })
    .click();
  assert(
    (await page.getByRole("status").innerText()).includes(
      "Deposit 2,500 Token 1",
    ),
    "push must be described as deposit",
  );
  assert(
    (await qos.innerText()).includes("Inventory replenished"),
    "push outcome",
  );
  assert(
    (await qos.locator(".transfer-list li").count()) === 1,
    "push has one Transfer event",
  );
  assert(
    (await qos.locator(".transfer-list").innerText()).includes("2,500"),
    "push amount",
  );

  let selections = 0;
  for (const count of ["2", "4", "8"])
    for (const policy of ["C", "C100"])
      for (const baseline of ["B", "A"]) {
        await page
          .getByRole("combobox", { name: "Strategies", exact: true })
          .selectOption(count);
        await page
          .getByRole("combobox", { name: "Guarantee policy", exact: true })
          .selectOption(policy);
        await page
          .getByRole("combobox", { name: "Reference system", exact: true })
          .selectOption(baseline);
        for (const workload of [
          "concentratedOverload",
          "replenishment",
          "lowContention",
          "adversarialOrder",
          "balancedRoundRobin",
          "shuffledPermutation",
        ]) {
          await page
            .getByRole("combobox", { name: "Workload", exact: true })
            .selectOption(workload);
          assert(
            await page
              .getByRole("button", {
                name: "Previous transaction",
                exact: true,
              })
              .isDisabled(),
            "scenario reset",
          );
          await page
            .getByRole("button", { name: /^Show recorded step / })
            .last()
            .click();
          assert(
            await page
              .getByRole("button", { name: "Next transaction", exact: true })
              .isDisabled(),
            "end boundary",
          );
          assert(
            (await page.locator(".guarded .strategy-list>div").count()) ===
              Number(count) + 1,
            "strategy rows",
          );
          await page
            .getByRole("button", { name: "Token 0", exact: true })
            .click();
          assert(
            (await page.locator(".guarded .balance-main").innerText()).includes(
              "Token 0",
            ),
            "token switch",
          );
          await page
            .getByRole("button", { name: "Token 1", exact: true })
            .click();
          selections++;
        }
      }

  await page
    .getByRole("combobox", { name: "Strategies", exact: true })
    .selectOption("2");
  await page
    .getByRole("combobox", { name: "Workload", exact: true })
    .selectOption("concentratedOverload");
  await page
    .getByRole("combobox", { name: "Reference system", exact: true })
    .selectOption("B");
  await page
    .getByRole("button", { name: "Show recorded step 2", exact: true })
    .click();
  assert(
    (await page.locator(".guarded .meter-legend").innerText()).includes(
      "7,000 protected",
    ),
    "C100 remaining entitlement",
  );
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `no body overflow at ${width}`,
    );
    await page.screenshot({
      path: `output/playwright/next-workspace-${width}.png`,
      fullPage: true,
    });
  }
  await page
    .getByRole("link", { name: "Protocol evidence", exact: true })
    .click();
  await page.getByRole("heading", { name: "Open the receipts." }).waitFor();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "proof mobile overflow",
  );
  for (const link of await page.locator('main a[href^="/evidence/"]').all()) {
    const response = await page.request.get(
      origin + (await link.getAttribute("href")),
    );
    assert(response.ok(), "evidence download must exist");
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "output/playwright/next-proof-desktop.png",
    fullPage: true,
  });
  await page.route("**/evidence/report.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"runs":[]}',
    }),
  );
  await page.goto(origin);
  await page
    .getByRole("heading", { name: "Evidence could not be loaded" })
    .waitFor();
  assert(
    (await page
      .getByRole("button", { name: "Next transaction", exact: true })
      .count()) === 0,
    "malformed data must not enable replay",
  );
  await page.unroute("**/evidence/report.json");
  await page
    .getByRole("button", { name: "Retry loading", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Next transaction", exact: true })
    .waitFor();
  assert(errors.length === 0, `browser exceptions: ${errors.join("; ")}`);
  return `Passed ${selections} policy/workload selections, recorded fill/reject/push assertions, 3 widths, evidence links and malformed-data recovery.`;
}
