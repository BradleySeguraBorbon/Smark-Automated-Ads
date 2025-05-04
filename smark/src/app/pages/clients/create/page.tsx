"use client"

import {useState, useEffect} from "react"
import {useRouter, usePathname} from "next/navigation"
import {ControllerRenderProps, useForm} from "react-hook-form"
import {IClient} from "@/types/Client"
import {useClientStore} from "@/lib/store"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Checkbox} from "@/components/ui/checkbox"
import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {format} from "date-fns"
import {CalendarIcon, ChevronLeft, X, Plus} from "lucide-react"
import {Label} from "@/components/ui/label"
import {Badge} from "@/components/ui/badge"
import Link from "next/link"
import {Navbar} from "@/components/Navbar";

export default function CreateClientPage() {
    const router = useRouter()
    const {addClient} = useClientStore()
    const [mounted, setMounted] = useState(false)
    const [newPreference, setNewPreference] = useState("")
    const [apiError, setApiError] = useState<string | null>(null);

    const currentPath = usePathname();
    const routes = [
        {href: "/", label: "Dashboard"},
        {href: "/campaigns", label: "Campaigns"},
        {href: "/adMessages", label: "Ad-Messages"},
        {href: "/clients", label: "Clients"},
        {href: "/analytics", label: "Analytics"},
    ];

    const form = useForm<IClient>({
        defaultValues: {
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
    }, [])

    async function onSubmit(data: IClient) {
        data.tags = [];

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDYzMzUyNzYsImV4cCI6MTc0NjMzODg3Nn0.w2Qigl5eY70X_yw7ct--SHDmYpMk9PuN2WeOC0uNRcw`
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error(result);
                const errorMessage = result.message || result.error || 'Unknown error occurred';
                setApiError(errorMessage);
                return;
            }

            console.log('Client created:', result);
            setApiError(null);
            addClient(data);
            router.back();

        } catch (error) {
            console.error('Network or unexpected error:', error);
            alert('Unexpected error occurred.');
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

    return (
        <div className="container mx-auto py-10">
            <header>
                <Navbar currentPath={currentPath} routes={routes}/>
            </header>
            <div className="flex items-center mb-6">
                <Link href="/clients">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="mr-2 h-4 w-4"/>
                        Back to Clients
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold ml-4">Create New Client</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    rules={{
                                        required: "First name is required",
                                        maxLength: {
                                            value: 50,
                                            message: "First name cannot exceed 50 characters",
                                        },
                                    }}
                                    name="firstName"
                                    render={({field, fieldState}) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage>{fieldState.error?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    rules={{
                                        required: "Last name is required",
                                        maxLength: {
                                            value: 50,
                                            message: "Last name cannot exceed 50 characters",
                                        },
                                    }}
                                    name="lastName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: "Invalid email address",
                                        },
                                    }}
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="john.doe@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    rules={{
                                        required: "Phone number is required",
                                        pattern: {
                                            value: /^\+?[1-9]\d{1,14}$/,
                                            message: "Invalid phone number format",
                                        },
                                    }}
                                    render={({field}: ControllerRenderProps<IClient, 'phone'>) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 (555) 123-4567" {...field} type="number"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="telegramChatId"
                                    rules={{
                                        maxLength: {
                                            value: 50,
                                            message: "Telegram Chat ID cannot exceed 50 characters",
                                        },
                                        required: "Email is required",
                                    }}
                                    render={({field}: ControllerRenderProps<IClient, 'telegramChatId'>) => (
                                        <FormItem>
                                            <FormLabel>Telegram Chat Id</FormLabel>
                                            <FormControl>
                                                <Input placeholder="id" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    rules={{
                                        required: "Birth date is required",
                                        validate: (value: Date) =>
                                            value <= new Date() || "Birth date cannot be in the future",
                                    }}
                                    render={({field}: ControllerRenderProps<IClient, 'birthDate'>) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                                                        onSelect={(date) => {
                                                            if (date) field.onChange(date)
                                                        }}
                                                        disabled={(date) => !date || date > new Date() || date < new Date("1900-01-01")}
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
                                name="preferredContactMethod"
                                rules={{
                                    required: "Preferred contact method is required",
                                    validate: (value: string) =>
                                        ["email", "telegram"].includes(value) || "Invalid contact method",
                                }}
                                render={({field}: ControllerRenderProps<IClient, 'preferredContactMethod'>) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Preferred Contact Method</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="email"/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Email</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="telegram"/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Telegram</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="preferences"
                                rules={{
                                    validate: (value) =>
                                        value && value.length >= 2 || "You have to add at least 2 preferences.",
                                }}
                                render={({field}) => (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Preferences</CardTitle>
                                            <CardDescription>Add your preferences for better targeting</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Client Preferences</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {field.value.map((preference: string, index: number) => (
                                                        <Badge key={index} variant="secondary"
                                                               className="flex items-center gap-1">
                                                            {preference}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newPrefs = field.value.filter((p: string) => p !== preference);
                                                                    field.onChange(newPrefs);
                                                                }}
                                                            >
                                                                <X className="h-3 w-3"/>
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add preference (e.g., electronics, books)"
                                                        value={newPreference}
                                                        onChange={(e) => setNewPreference(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                if (newPreference && !field.value.includes(newPreference)) {
                                                                    field.onChange([...field.value, newPreference]);
                                                                    setNewPreference("");
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (newPreference && !field.value.includes(newPreference)) {
                                                                field.onChange([...field.value, newPreference]);
                                                                setNewPreference("");
                                                            }
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                            <FormMessage/>
                                        </CardContent>
                                    </Card>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="subscriptions"
                                rules={{
                                    validate: (value) =>
                                        value && value.length >= 1 || "You have to select at least one subscription.",
                                }}
                                render={({field}) => (
                                    <div className="space-y-2">
                                        <Label>Subscriptions</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="subscription-email"
                                                    checked={field.value.includes("email")}
                                                    onCheckedChange={() => {
                                                        const newValue = field.value.includes("email")
                                                            ? field.value.filter((v: string) => v !== "email")
                                                            : [...field.value, "email"];
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                                <Label htmlFor="subscription-email">Email Announcements</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="subscription-telegram"
                                                    checked={field.value.includes("telegram")}
                                                    onCheckedChange={() => {
                                                        const newValue = field.value.includes("telegram")
                                                            ? field.value.filter((v: string) => v !== "telegram")
                                                            : [...field.value, "telegram"];
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                                <Label htmlFor="subscription-telegram">Telegram Messages</Label>
                                            </div>
                                        </div>
                                        <FormMessage/>
                                    </div>
                                )}
                            />


                            <div className="flex justify-end">
                                <Button type="submit">Create Client</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
