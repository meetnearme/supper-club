# November 10, 2026 event records

Historical accounting records for The Redding Supper Club at Trilogy Guild, Redding. The attendee report was finalized November 16, 2026.

## Final accounts

| Item | USD |
| --- | ---: |
| Gross ticket payments | $1,394.33 |
| Guest refunds | −$150.00 |
| Payment processing fees | −$45.10 |
| Net ticket receipts | $1,199.23 |
| Catering | −$1,065.64 |
| Chair rental | −$31.66 |
| Meta advertising | −$78.31 |
| One-off purchase of 24 wine glasses | −$46.31 |
| **Final event result** | **−$22.69** |

## Record layout

```text
2026-11-10/
├── README.md
├── expenses/
│   └── 2026_11_10_expenses.csv
└── revenue/
    ├── 2026_11_10_ticket_reconciliation.csv
    ├── ticket_sales.csv
    └── unified_payments.csv
```

## Scrubbed accounting records

- [Final attendee report](../../reports/2026_11_10_spending_report.html)
- [Expense ledger](expenses/2026_11_10_expenses.csv), with `source_document` citations identifying the original documents by filename
- [Ticket reconciliation](revenue/2026_11_10_ticket_reconciliation.csv)
- [Ticket sales](revenue/ticket_sales.csv)
- [Payments](revenue/unified_payments.csv)

The revenue CSVs preserve every amount, quantity, refund, fee, and payment outcome. Customer names/emails, original buyer/payment/card/payout identifiers, meal choices, decline reasons and messages, and exact times were removed. New `order-###` and `payment-###` references link the three files within this event. Dates are retained at day precision, with Pacific and UTC columns labeled explicitly. The two failed payments remain for reconciliation with their personal decline details removed.

These are pseudonymized accounting records, not a guarantee of anonymity: dates, amounts, and the small event size can still make individual transactions recognizable. Share the aggregate attendee report publicly.

## Source document citations

Original exports and PDFs contain personal information and are not included in the public repository. The ledger's `source_document` values and filenames below are historical citations, not links or filesystem dependencies. The scrubbed accounts and website build work without the original files.

| Source document | Expense | USD |
| --- | --- | ---: |
| `c_c_catering_final_2026_11_10.pdf` | C & C Catering: $864.00 dinner menus, $62.64 tax, $139.00 operation fee | $1,065.64 |
| `BF-20261111-02-chair-rental-receipt.pdf` | A Planned Affair: $27.00 rental, $2.70 wear and tear, $1.96 tax | $31.66 |
| `BF-20261111-02-meta-ads.pdf` | SmartLemon's itemized Meta advertising spend, October 8–November 9 | $78.31 |

The $46.31 Kohl's purchase of 24 wine glasses is an organizer-provided expense. No glassware receipt was supplied; the full purchase is allocated to this event. The final report records event income and costs. The ledger retains the payment evidence supplied with each document; finalizing the report does not change an invoice into proof of payment. Reimbursements for these costs are not additional expenses.

All `records/` files are excluded from the static website build and blocked by the local preview server. The attendee report has no CSV or PDF links. Keep future events in their own dated directories under `records/`. Retain any original documents separately if needed for bookkeeping; they are not required by this archive.
