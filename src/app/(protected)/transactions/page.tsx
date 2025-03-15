import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types";

const getTransactions = async (): Promise<Transaction[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_transactions")
    .select(
      `
      *,
      entries:accounting_entries(
        *,
        item:accounting_items(
          *
        )
      )
    `
    )
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
};

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="pb-16">
      <h1 className="text-xl font-bold p-4">取引履歴</h1>

      <div className="fixed bottom-16 right-4">
        <button className="bg-blue-600 text-white rounded-full p-4 shadow-lg">
          <span className="text-2xl">+</span>
        </button>
      </div>

      <div className="space-y-4 p-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString("ja-JP")}
                </div>
                <div className="font-medium">{transaction.description}</div>
              </div>
              <div className="text-right">
                {transaction.entries.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    {entry.item.name}:{" "}
                    {entry.side === "debit" ? "借方" : "貸方"}
                    {entry.amount.toLocaleString()}円
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
