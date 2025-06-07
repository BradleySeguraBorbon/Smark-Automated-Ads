'use client'

import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ITemplate } from "@/types/Template"

interface Props {
    template: ITemplate
    userRole: string
    onDeleteAction: (id: string) => void
}

export default function TemplateRow({ template, userRole, onDeleteAction }: Props) {
    const canEdit = userRole === 'developer'
    //const badgeClass = "text-xs bg-muted px-2 py-0.5 rounded-full border"

    return (
        <tr className="border-b hover:bg-muted transition">
            <td className="py-4 px-2 font-medium text-foreground">{template.name}</td>
            <td className="py-4 px-2">
        <span className={`text-xs rounded-full px-3 py-1 ${template.type === 'email' ? 'bg-black text-white' : 'bg-muted'}`}>
          {template.type === 'email' ? '✉️ Email' : '💬 Telegram'}
        </span>
            </td>
            {/*<td className="py-4 px-2 flex flex-wrap gap-1">
                {template.placeholders.slice(0, 3).map((ph, i) => (
                    <span key={i} className={badgeClass}>{ph}</span>
                ))}
                {template.placeholders.length > 3 && (
                    <span className={badgeClass}>+{template.placeholders.length - 3}</span>
                )}
            </td>*/}
            <td className="py-4 px-2">{new Date(template.updatedAt as Date).toLocaleString("es-CR")}</td>
            <td className="py-4 px-2">
                <div className="flex gap-2">
                    <Link href={`/templates/${template._id}`}>
                        <Button variant="default" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">view</span>
                        </Button>
                    </Link>
                    {canEdit && (
                        <>
                            <Link href={`/templates/${template._id}/edit`}>
                                <Button variant="secondary" className="bg-blue-500 hover:bg-blue-800" size="icon">
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                            </Link>
                            <Button onClick={() => onDeleteAction(template._id! as string)} variant="secondary" className={"bg-teal-600 hover:bg-teal-800"} size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
}
