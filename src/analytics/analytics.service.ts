import { Injectable } from "@nestjs/common";
import { TransactionType } from "@prisma/client";
import { getDateRange } from "src/common/utils/dateRange";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) {}

    async getDashboard(userId: string, year: number, month?: number) {
        const { start, end } = getDateRange(year, month);

        const [
            summary,
            expensesByCategory,
            incomesByCategory,
            savingsByCategory,
        ] = await Promise.all([
            this.getSummary(userId, start, end),
            this.getCategoryBreakdown(userId, "EXPENSE", start, end),
            this.getCategoryBreakdown(userId, "INCOME", start, end),
            this.getCategoryBreakdown(userId, "SAVING", start, end),
        ]);

        return {
            summary,
            expensesByCategory,
            incomesByCategory,
            savingsByCategory,
        };
    }

    private async getSummary(userId: string, start: Date, end: Date) {
        const result = await this.prisma.transaction.groupBy({
            by: ["type"],
            where: {
                userId,
                date: {
                    gte: start,
                    lt: end,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const income =
            result.find((r) => r.type === "INCOME")?._sum.amount || 0;
        const expense =
            result.find((r) => r.type === "EXPENSE")?._sum.amount || 0;
        const saving =
            result.find((r) => r.type === "SAVING")?._sum.amount || 0;

        return {
            income,
            expense,
            saving,
        };
    }

    private async getCategoryBreakdown(
        userId: string,
        type: TransactionType,
        start: Date,
        end: Date,
    ) {
        const result = await this.prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
                userId,
                type,
                date: {
                    gte: start,
                    lt: end,
                },
            },
            _sum: {
                amount: true,
            },
            orderBy: {
                _sum: {
                    amount: "desc",
                },
            },
        });

        const categories = await this.prisma.category.findMany({
            where: {
                userId,
                type
            },
            select: {
                id: true,
                name: true,
            },
        });

        const resultMap = new Map(result.map((r) => [r.categoryId, r._sum.amount]));
        categories.push({
            id: "",
            name: "OTHER"
        })

        return categories.map((category) => ({
            id: category.id != "" ? category.id : null,
            name: category.name,
            total: category.id == "" ? resultMap.get(null) || 0 : resultMap.get(category.id) || 0
        }))
    }
}
