import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table"
import data from "./data/reversals.json"

interface ReversalRequest {
  Name: string
  "Customer Location (timezone)": string
  "Sign up date": string
  "Request Source": string
  "Investment Date": string
  "Investment Time": string
  "Refund Request Date": string
  "Refund Request Time": string
}

const RefundTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead>Customer Location (timezone)</TableHead>
          <TableHead>Sign up date</TableHead>
          <TableHead>Request Source</TableHead>
          <TableHead>Investment Date</TableHead>
          <TableHead>Investment Time</TableHead>
          <TableHead>Refund Request Date</TableHead>
          <TableHead>Refund Request Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: ReversalRequest) => (
          <TableRow key={row.Name}>
            <TableCell className="font-medium">{row.Name}</TableCell>
            <TableCell>{row["Customer Location (timezone)"]}</TableCell>
            <TableCell>{row["Sign up date"]}</TableCell>
            <TableCell>{row["Request Source"]}</TableCell>
            <TableCell>{row["Investment Date"]}</TableCell>
            <TableCell>{row["Investment Time"]}</TableCell>
            <TableCell>{row["Refund Request Date"]}</TableCell>
            <TableCell>{row["Refund Request Time"]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default RefundTable
