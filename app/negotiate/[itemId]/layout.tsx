import itemsData from '@/data/items.json';

export async function generateStaticParams() {
  return itemsData.map((item) => ({
    itemId: item.id.toString(),
  }));
}

export default function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}