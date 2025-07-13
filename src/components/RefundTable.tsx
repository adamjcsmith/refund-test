import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import data from "../data/reversals.json"
import { ReversalRequest } from "@/types"

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
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.customerTZ}</TableCell>
            <TableCell>{row.signupDate}</TableCell>
            <TableCell>{row.source}</TableCell>
            <TableCell>{row.investmentDate}</TableCell>
            <TableCell>{row.investmentTime}</TableCell>
            <TableCell>{row.requestDate}</TableCell>
            <TableCell>{row.requestTime}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default RefundTable
