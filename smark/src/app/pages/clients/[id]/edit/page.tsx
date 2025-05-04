"use client"

import {useState, useEffect} from "react"
import {useRouter, useParams} from "next/navigation"
import {useForm} from "react-hook-form"
import {IClient} from "@/types/Client"
import {TagSelector} from "@/components/TagSelector"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {format} from "date-fns"
import {CalendarIcon, ChevronLeft} from 'lucide-react'
import Link from "next/link"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {ITag} from "@/types/Tag";

export default function EditClientPage() {
    const params = useParams();
    const id = params.id;
    const [apiError, setApiError] = useState<string | null>(null)
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [fetchedTags, setFetchedTags] = useState<ITag[]>([]);
    const [clientData, setClientData] = useState<IClient | null>(null);

    const tagOptions: ITag[] = fetchedTags;

    const form = useForm<IClient>({
        defaultValues: {
            _id: id,
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            telegramChatId: "",
            preferredContactMethod: "email",
            birthDate: new Date(),
            preferences: [],
            tags: [],
            subscriptions: [],
        },
    })

    useEffect(() => {
        setMounted(true)
        const fetchClient = async () => {
            try {
                const response = await fetch(`/api/clients/${id}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDYzNDIwNTAsImV4cCI6MTc0NjM0NTY1MH0.nlz-U9egiYW1EsxZ42kEKR5rcOEnqVtqcPFOzqN2l7k`
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error(result);
                    const errorMessage = result.message || result.error || 'Unknown error occurred';
                    setApiError(errorMessage);
                    return;
                }

                setApiError(null);
                const client = result.result;

                if (client) {
                    setClientData(client);

                    form.reset({
                        ...client,
                        tags: (client.tags || []).map((tag: any) =>
                            typeof tag === 'object' && tag._id ? tag._id : tag
                        ),
                        birthDate: client.birthDate instanceof Date ? client.birthDate : new Date(client.birthDate),
                    })
                } else {
                    setNotFound(true)
                }


            } catch (error) {
                console.error('Network or unexpected error:', error);
                alert('Unexpected error occurred.');
            }
        }

        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDYzNDIwNTAsImV4cCI6MTc0NjM0NTY1MH0.nlz-U9egiYW1EsxZ42kEKR5rcOEnqVtqcPFOzqN2l7k`
                    },
                });
                const result = await response.json();
                console.log('Tags fetched:', result);

                if (response.ok) {
                    setFetchedTags(result.results || []);
                } else {
                    console.error('Failed fetching tags', result);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }

        };

        fetchClient();
        fetchTags();
    }, [params.id, form])

    async function onSubmit(data: IClient) {
        try {
            console.log("Submitting data:", data);
            const response = await fetch(`/api/clients/${data._id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDYzNDIwNTAsImV4cCI6MTc0NjM0NTY1MH0.nlz-U9egiYW1EsxZ42kEKR5rcOEnqVtqcPFOzqN2l7k`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log('Client Updated:', result);

            if (response.ok) {
                router.push("/pages/clients")
            } else {
                console.error('Failed updating client', result);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    }

    if (!mounted) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center mb-6">
                    <h1 className="text-3xl font-bold">Loading...</h1>
                </div>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Client not found. <Link href="/clients" className="underline">Return to clients list</Link>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center mb-6">
                <Link href="/clients">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="mr-2 h-4 w-4"/>
                        Back to Clients
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold ml-4">Edit Client</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="telegramChatId"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Telegram Chat ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({field}) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                            disabled
                                                        >
                                                            {field.value ? format(field.value, "PPP") :
                                                                <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        disabled
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({field}) => (
                                    <FormItem>
                                        <div className="text-sm font-medium">Tags</div>
                                        <FormControl>
                                            <TagSelector
                                                tags={tagOptions}
                                                selected={field.value || []}
                                                onChange={(newSelected) => field.onChange(newSelected)}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />


                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => router.push("/clients")}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
