import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Константы
const API_KEY = "316b2be8-3475-4462-bd57-c7794d4bdb53";
const SECRET = "1234567890";

// Реализация алгоритма Луна
const validateLuhn = (number: string) => {
  let sum = 0;
  let isEven = false;

  // Удаляем все пробелы и дефисы
  number = number.replace(/\D/g, "");

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Функция валидации срока действия карты
const validateExpiryDate = (value: string): boolean => {
  if (!value) return false;

  const [month, year] = value.split("/").map((part) => parseInt(part, 10));
  const currentYear = new Date().getFullYear() % 100; // Получаем последние 2 цифры текущего года

  // Проверяем, что месяц в диапазоне 1-12
  if (!month || month < 1 || month > 12) return false;

  // Проверяем, что год не меньше текущего
  if (!year || year < currentYear) return false;

  return true;
};

// Функция форматирования суммы
const formatAmount = (value: string): string => {
  // Убираем все нецифровые символы
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";

  // Форматируем число с разделителями тысяч
  const formatted = new Intl.NumberFormat("ru-RU").format(parseInt(numbers));
  return `${formatted} ₽`;
};

// Функция очистки суммы от форматирования
const cleanAmount = (value: string): string => {
  return value.replace(/\D/g, "");
};

const PaymentForm = () => {
  const navigate = useNavigate();

  // Состояние формы
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: "500 ₽",
    name: "",
    message: "Экскурсия",
  });

  // Состояние ошибок
  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: "",
    name: "",
  });

  // Функции маскирования
  const maskCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const matched = cleaned.match(/(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/);
    return matched
      ? !matched[2]
        ? matched[1]
        : !matched[3]
        ? `${matched[1]} ${matched[2]}`
        : !matched[4]
        ? `${matched[1]} ${matched[2]} ${matched[3]}`
        : `${matched[1]} ${matched[2]} ${matched[3]} ${matched[4]}`
      : "";
  };

  const maskExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const matched = cleaned.match(/(\d{0,2})(\d{0,2})/);
    const currentYear = new Date().getFullYear() % 100; // Получаем последние 2 цифры текущего года

    if (!matched) return "";

    let month = matched[1];
    let year = matched[2];

    // Корректируем месяц
    if (month.length === 1 && parseInt(month) > 1) {
      month = `0${month}`;
    } else if (month.length === 2) {
      const monthNum = parseInt(month);
      if (monthNum === 0) month = "01";
      if (monthNum > 12) month = "12";
    }

    // Корректируем год
    if (year.length === 2 && parseInt(year) < currentYear) {
      year = currentYear.toString();
    }

    return year ? `${month}/${year}` : month;
  };

  // Обработчики ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    switch (name) {
      case "cardNumber":
        maskedValue = maskCardNumber(value);
        break;
      case "expiryDate":
        maskedValue = maskExpiryDate(value);
        break;
      case "cvv":
        maskedValue = value.replace(/\D/g, "").slice(0, 3);
        break;
      case "amount":
        // Если пользователь стирает значение полностью, оставляем пустую строку
        maskedValue = value === "" ? "" : formatAmount(value);
        break;
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: maskedValue,
    }));

    // Очищаем ошибку при вводе
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {} as any;

    if (!formData.cardNumber) {
      newErrors.cardNumber = "Введите номер карты";
    } else if (!validateLuhn(formData.cardNumber)) {
      newErrors.cardNumber = "Неверный номер карты";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Введите срок";
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = "Неверный срок действия карты";
    }

    if (!formData.cvv) {
      newErrors.cvv = "Введите CVV";
    }

    const cleanedAmount = cleanAmount(formData.amount);
    if (!cleanedAmount) {
      newErrors.amount = "Введите сумму";
    } else if (parseInt(cleanedAmount) < 10) {
      newErrors.amount = "Минимальная сумма 10 ₽";
    }

    if (!formData.name) {
      newErrors.name = "Введите имя";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Создаем ID транзакции
    const transactionId = Date.now().toString();

    // Получаем чистое значение суммы без форматирования
    const cleanedAmount = cleanAmount(formData.amount);

    // Создаем хеш-сумму
    const dataToHash = `${API_KEY}${transactionId}${cleanedAmount}${SECRET}`;
    const hashSum = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(dataToHash))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      );

    // Подготавливаем тело запроса
    const requestBody = {
      hashsum: hashSum,
      transaction: transactionId,
      description: formData.message,
      apikey: API_KEY,
      amount: parseInt(cleanedAmount),
      custom_data: {
        initiator: "Иван К.",
        event: "Экскурсия",
      },
    };

    // Перенаправляем на страницу с данными запроса
    navigate("./request-details", { state: { requestBody } });
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white rounded-lg">
        <h1 className="text-xl font-semibold mb-6">
          Иван К. собирает на «Экскурсия»
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#22252BB2] mb-1">
              Номер карты
            </label>
            <Input
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              className={errors.cardNumber ? "border-red-500" : ""}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#22252BB2] mb-1">
                Срок действия
              </label>
              <Input
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="ММ/ГГ"
                className={errors.expiryDate ? "border-red-500" : ""}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#22252BB2] mb-1">
                CVV
              </label>
              <Input
                name="cvv"
                type="password"
                value={formData.cvv}
                onChange={handleInputChange}
                className={errors.cvv ? "border-red-500" : ""}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#22252BB2] mb-1">
              Сумма перевода
            </label>
            <Input
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="₽"
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#22252BB2] mb-1">
              Ваше имя
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#22252BB2] mb-1">
              Сообщение получателю
            </label>
            <Input
              name="message"
              value={formData.message}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" size={"lg"}>
              Перевести
            </Button>
            <Button
              type="button"
              variant="secondary"
              size={"lg"}
              onClick={() => window.history.back()}
            >
              Вернуться
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PaymentForm;
