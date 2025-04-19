import ReportDetails from "./ReportDetails"

export default function Page({ params }: { params: { id: string } }) {
  return <ReportDetails id={params.id} />
}