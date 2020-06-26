int fun1() {
    return 0;
}

int fun2(int a) {
    return a;
}

int fun3(int a, int b) {
    return a + b;
}

long long fun4() {
    return 0;
}

long long fun5(long long a) {
    return a;
}

long long fun6(long long a, long long b) {
    return a + b;
}

void fun7() {
}

int fun8(char *a) {
    int i = 0;
    while (a[i] != 0) {
        i++;
    }
    return i;
}

int fun9(char *dst, char *src) {
    int i = 0;
    while (src[i] != 0) {
        dst[i] = src[i];
        i++;
    }
    dst[i] = 0;
    return i;
}

char* fun10() {
    return "ding";
}

char* fun11(char *a) {
    return a;
}
